"""
ChemSpace Batch Molecular Workflow Engine
Processes collections of compounds (SMILES lists, names, or multi-record SDF)
with fault isolation: failures on one compound do not halt or crash the remaining batch.
"""

import time
import uuid
import logging
from typing import Dict, Any, List, Optional

from backend.universal_validator import universal_validate_molecule
from backend.smart_preparator import smart_prepare_molecule
from backend.pure_cheminformatics import parse_smiles_pure, calculate_pure_properties

logger = logging.getLogger("chemspace.batch_engine")


class BatchProcessingJob:
    def __init__(self, batch_id: str, items: List[str], template_id: Optional[str] = None):
        self.batch_id = batch_id
        self.created_at = time.time()
        self.template_id = template_id or "batch-screening"
        self.total_count = len(items)
        self.completed_count = 0
        self.failed_count = 0
        self.status = "queued"  # queued, running, completed, partially_failed
        self.items: List[Dict[str, Any]] = []

        for idx, item in enumerate(items):
            self.items.append({
                "item_index": idx,
                "input_string": item.strip(),
                "status": "pending",
                "validation": None,
                "preparation": None,
                "properties": None,
                "error": None
            })

    def to_dict(self) -> Dict[str, Any]:
        results_formatted = []
        for itm in self.items:
            prep = itm.get("preparation") or {}
            results_formatted.append({
                "raw_input": itm["input_string"],
                "compound_index": itm["item_index"] + 1,
                "status": "Completed" if itm["status"] == "completed" else "Failed",
                "preparation_applied": bool(prep.get("stripped_counterions")),
                "prepared_formula": itm.get("properties", {}).get("formula") if itm.get("properties") else None,
                "properties": itm.get("properties"),
                "three_d_conformers": prep.get("conformers_3d"),
                "error": itm.get("error")
            })

        return {
            "batch_id": self.batch_id,
            "created_at": self.created_at,
            "template_id": self.template_id,
            "template_applied": self.template_id,
            "total_count": self.total_count,
            "total_compounds": self.total_count,
            "completed": self.completed_count,
            "completed_count": self.completed_count,
            "failed": self.failed_count,
            "failed_count": self.failed_count,
            "status": self.status,
            "items": self.items,
            "results": results_formatted
        }



def parse_batch_input(raw_input: str) -> List[str]:
    """Extracts individual compound records from multi-line text, comma-separated, or SDF."""
    lines = raw_input.strip().splitlines()
    compounds: List[str] = []

    # Check if SDF multi-record
    if "$$$$" in raw_input:
        records = raw_input.split("$$$$")
        for rec in records:
            r = rec.strip()
            if r:
                compounds.append(r)
        return compounds

    for line in lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        # Check comma separated
        if "," in line and not line.startswith("InChI="):
            for part in line.split(","):
                p = part.strip()
                if p:
                    compounds.append(p)
        else:
            compounds.append(line)

    return compounds


def execute_batch_job(items: List[str], template_id: Optional[str] = None) -> Dict[str, Any]:
    """Synchronously processes batch items with full error isolation."""
    job_id = f"batch-{uuid.uuid4().hex[:10]}"
    job = BatchProcessingJob(job_id, items, template_id)
    job.status = "running"

    for entry in job.items:
        inp = entry["input_string"]
        try:
            # 1. Validate
            val_report = universal_validate_molecule(inp)
            entry["validation"] = val_report.to_dict()

            if not val_report.is_valid:
                entry["status"] = "failed"
                entry["error"] = "; ".join(val_report.errors) or "Invalid chemical syntax."
                job.failed_count += 1
                continue

            # 2. Smart Preparation (Desalt + 3D Conformer)
            prep_res = smart_prepare_molecule(val_report.canonical_smiles or inp, strip_salts=True, generate_3d=True)
            entry["preparation"] = prep_res.to_dict()

            # 3. Calculated Properties
            entry["properties"] = {
                "formula": val_report.molecular_formula,
                "molecular_weight": val_report.molecular_weight,
                "formal_charge": val_report.formal_charge,
                "heavy_atom_count": val_report.heavy_atom_count,
                "rotatable_bonds": val_report.num_rotatable_bonds,
                "is_salt": val_report.is_salt_or_mixture
            }

            entry["status"] = "completed"
            job.completed_count += 1

        except Exception as e:
            logger.exception("Error processing batch item %s: %s", inp, e)
            entry["status"] = "failed"
            entry["error"] = str(e)
            job.failed_count += 1

    if job.failed_count == 0:
        job.status = "completed"
    elif job.completed_count > 0:
        job.status = "partially_failed"
    else:
        job.status = "failed"

    return job.to_dict()
