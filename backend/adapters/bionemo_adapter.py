"""
BioNeMo Agent Toolkit Backend Adapter Layer
Provides unified interface to NVIDIA BioNeMo NIM microservices and pipelines:
- drug-discovery-pipeline (GenMol -> DiffDock -> Boltz-2)
- genmol-nim (Small-molecule generation & lead optimization)
- diffdock-nim (Blind molecular docking & pose prediction)
- boltz2-nim (Biomolecular structure prediction & affinity scoring)
- molmim-nim (Latent-space molecule optimization)

Enforces strict scientific honesty:
- Unconfigured services report precise setup requirements without inventing outputs
- Requests to unconfigured services return structured configuration errors
- Zero credential leakage in public API responses
"""

import os
import logging
from typing import Dict, Any, Optional, List
import urllib.request
import urllib.error
import json

logger = logging.getLogger("chemspace.adapters.bionemo")

# Official hosted endpoints documented in bionemo-agent-toolkit
HOSTED_ENDPOINTS = {
    "drug-discovery-pipeline": "https://health.api.nvidia.com/v1/biology/meta/drug-discovery",
    "genmol-nim": "https://health.api.nvidia.com/v1/biology/nvidia/genmol/generate",
    "diffdock-nim": "https://health.api.nvidia.com/v1/biology/mit/diffdock",
    "boltz2-nim": "https://health.api.nvidia.com/v1/biology/mit/boltz2",
    "molmim-nim": "https://health.api.nvidia.com/v1/biology/nvidia/molmim"
}


class BioNeMoAdapter:
    """Scientific adapter for NVIDIA BioNeMo NIM services."""

    def __init__(self):
        self._refresh_credentials()

    def _refresh_credentials(self):
        self.api_key = os.getenv("NGC_API_KEY") or os.getenv("NVIDIA_API_KEY") or ""
        self.local_nim_host = os.getenv("BIONEMO_LOCAL_HOST", "http://localhost:8000")

    def is_configured(self) -> bool:
        """Check if an API key is present in environment."""
        self._refresh_credentials()
        return bool(self.api_key and len(self.api_key.strip()) > 8)

    def get_masked_key(self) -> Optional[str]:
        """Return masked key for diagnostics without revealing secrets."""
        self._refresh_credentials()
        if not self.api_key:
            return None
        k = self.api_key.strip()
        if len(k) <= 8:
            return "********"
        return f"{k[:4]}...{k[-4:]}"

    def get_catalog_status(self) -> Dict[str, Any]:
        """Return provider-neutral capability status of all biological microservices."""
        configured = self.is_configured()
        masked_key = self.get_masked_key()

        services = {
            "drug-discovery-pipeline": {
                "name": "Generative Virtual Screening Pipeline",
                "description": "Multi-stage pipeline chaining candidate generation, blind docking, and binding affinity prediction.",
                "stages": ["Candidate Generation (GenMol)", "Target Docking (DiffDock)", "Affinity Scoring (Boltz-2)"],
                "status": "ready" if configured else "unconfigured",
                "requirements": ["Protein Target (PDB format)", "SMILES / SAFE core scaffold", "NGC_API_KEY"],
                "endpoint": HOSTED_ENDPOINTS["drug-discovery-pipeline"],
                "license": "Apache-2.0 / CC-BY-4.0",
                "hardware_requirement": "Cloud Hosted NIM or Local GPU (>=24GB VRAM)"
            },
            "genmol-nim": {
                "name": "De Novo Molecular Generator (GenMol)",
                "description": "Diffusion-based small molecule generation and lead optimization.",
                "status": "ready" if configured else "unconfigured",
                "requirements": ["Input Seed / Scaffold", "Target Properties (QED / LogP)", "NGC_API_KEY"],
                "endpoint": HOSTED_ENDPOINTS["genmol-nim"],
                "license": "Apache-2.0",
                "hardware_requirement": "Cloud Hosted NIM or Local GPU"
            },
            "diffdock-nim": {
                "name": "Blind Molecular Docking (DiffDock)",
                "description": "Diffusion model for targeted molecular pose prediction and binding pocket docking.",
                "status": "ready" if configured else "unconfigured",
                "requirements": ["Target Protein PDB", "Ligand SMILES / SDF", "NGC_API_KEY"],
                "endpoint": HOSTED_ENDPOINTS["diffdock-nim"],
                "license": "MIT / Apache-2.0",
                "hardware_requirement": "Cloud Hosted NIM or Local GPU"
            },
            "boltz2-nim": {
                "name": "Complex Structure & Affinity (Boltz-2)",
                "description": "Biomolecular complex prediction and binding affinity scoring.",
                "status": "ready" if configured else "unconfigured",
                "requirements": ["Biomolecular Complex Spec", "NGC_API_KEY"],
                "endpoint": HOSTED_ENDPOINTS["boltz2-nim"],
                "license": "MIT / Apache-2.0",
                "hardware_requirement": "Cloud Hosted NIM or Local GPU"
            },
            "molmim-nim": {
                "name": "Latent Molecule Optimizer (MolMIM)",
                "description": "Latent space small-molecule sampling and directed property optimization.",
                "status": "ready" if configured else "unconfigured",
                "requirements": ["Seed SMILES", "Optimization Objective", "NGC_API_KEY"],
                "endpoint": HOSTED_ENDPOINTS["molmim-nim"],
                "license": "Apache-2.0",
                "hardware_requirement": "Cloud Hosted NIM or Local GPU"
            }
        }

        return {
            "configured": configured,
            "credential_source": "NGC_API_KEY / NVIDIA_API_KEY" if configured else "None detected",
            "masked_key": masked_key,
            "services": services,
            "setup_instructions": (
                "To enable cloud-hosted scientific pipeline services, add NGC_API_KEY to your server "
                ".env file. Alternatively, launch local NIM containers with GPU passthrough."
            )
        }

    def execute_service(self, service_id: str, payload: Dict[str, Any], timeout: int = 45) -> Dict[str, Any]:
        """
        Execute a call to a scientific NIM service.
        If unconfigured, strictly returns structured configuration requirement error.
        Never fabricates model outputs or falsifies execution.
        """
        self._refresh_credentials()

        if service_id not in HOSTED_ENDPOINTS:
            return {
                "success": False,
                "error": f"Unknown biological service: '{service_id}'",
                "code": "INVALID_SERVICE"
            }

        if not self.is_configured():
            logger.warning(
                "Execution requested for '%s' but NGC_API_KEY is not configured.", service_id
            )
            return {
                "success": False,
                "error": (
                    f"Service '{service_id}' requires valid cloud credentials ($NGC_API_KEY). "
                    "The integration is currently in an explicit unconfigured state. "
                    "Configure NGC_API_KEY in server environment to enable live inference."
                ),
                "code": "AWAITING_CREDENTIALS",
                "service": service_id,
                "endpoint": HOSTED_ENDPOINTS[service_id],
                "configured": False
            }

        endpoint = HOSTED_ENDPOINTS[service_id]
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key.strip()}",
            "User-Agent": "ChemSpace-Scientific-Automation/1.0"
        }

        try:
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(endpoint, data=req_data, headers=headers, method="POST")

            with urllib.request.urlopen(req, timeout=timeout) as response:
                resp_code = response.getcode()
                raw_body = response.read().decode("utf-8")
                parsed = json.loads(raw_body)
                return {
                    "success": True,
                    "status_code": resp_code,
                    "service": service_id,
                    "data": parsed
                }
        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8", errors="ignore")
            logger.error("HTTP error calling %s: %s - %s", service_id, he.code, err_body)
            return {
                "success": False,
                "code": f"HTTP_{he.code}",
                "error": f"Cloud service error ({he.code}): {he.reason}",
                "details": err_body[:500]
            }
        except urllib.error.URLError as ue:
            logger.error("Network error reaching %s: %s", service_id, ue.reason)
            return {
                "success": False,
                "code": "NETWORK_ERROR",
                "error": f"Could not establish network connection to {endpoint}: {ue.reason}"
            }
        except Exception as exc:
            logger.exception("Unexpected error in BioNeMo adapter for %s", service_id)
            return {
                "success": False,
                "code": "EXECUTION_EXCEPTION",
                "error": f"Unexpected execution error: {str(exc)}"
            }


# Singleton instance
bionemo_adapter = BioNeMoAdapter()
