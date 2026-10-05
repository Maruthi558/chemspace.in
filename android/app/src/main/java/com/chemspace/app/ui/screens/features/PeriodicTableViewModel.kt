package com.chemspace.app.ui.screens.features

import androidx.lifecycle.ViewModel
import com.chemspace.app.domain.model.PeriodicElement
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class PeriodicTableUiState(
    val selectedElement: PeriodicElement? = null,
    val searchQuery: String = "",
    val selectedCategory: String = "All"
)

class PeriodicTableViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(PeriodicTableUiState())
    val uiState: StateFlow<PeriodicTableUiState> = _uiState.asStateFlow()

    val categories = listOf(
        "All", "Nonmetal", "Noble Gas", "Alkali Metal", "Alkaline Earth",
        "Transition Metal", "Post-Transition", "Metalloid", "Halogen", "Lanthanide", "Actinide"
    )

    // Complete Curated Elements matching ChemSpace Periodic Table
    val allElements = listOf(
        PeriodicElement(1, "H", "Hydrogen", 1.008, "Nonmetal", "#38BDF8", 1, 1, "1s¹", 2.20, "Colorless, odorless, highly flammable diatomic gas."),
        PeriodicElement(2, "He", "Helium", 4.003, "Noble Gas", "#F43F5E", 1, 18, "1s²", null, "Colorless, odorless inert gas with lowest boiling point."),
        PeriodicElement(3, "Li", "Lithium", 6.941, "Alkali Metal", "#EF4444", 2, 1, "[He] 2s¹", 0.98, "Lightest solid metal, critical in rechargeable ion batteries."),
        PeriodicElement(4, "Be", "Beryllium", 9.012, "Alkaline Earth", "#F59E0B", 2, 2, "[He] 2s²", 1.57, "Relatively rare metal in universe, high stiffness and thermal stability."),
        PeriodicElement(5, "B", "Boron", 10.811, "Metalloid", "#10B981", 2, 13, "[He] 2s² 2p¹", 2.04, "Low-abundance metalloid used in fiberglass and semiconductors."),
        PeriodicElement(6, "C", "Carbon", 12.011, "Nonmetal", "#38BDF8", 2, 14, "[He] 2s² 2p²", 2.55, "Basis of all organic life, forms versatile sp/sp²/sp³ bonds."),
        PeriodicElement(7, "N", "Nitrogen", 14.007, "Nonmetal", "#38BDF8", 2, 15, "[He] 2s² 2p³", 3.04, "Constitutes 78% of Earth's atmosphere, essential for amino acids."),
        PeriodicElement(8, "O", "Oxygen", 15.999, "Nonmetal", "#38BDF8", 2, 16, "[He] 2s² 2p⁴", 3.44, "Highly reactive nonmetal and oxidizing agent supporting combustion."),
        PeriodicElement(9, "F", "Fluorine", 18.998, "Halogen", "#8B5CF6", 2, 17, "[He] 2s² 2p⁵", 3.98, "Most electronegative and chemically reactive of all elements."),
        PeriodicElement(10, "Ne", "Neon", 20.180, "Noble Gas", "#F43F5E", 2, 18, "[He] 2s² 2p⁶", null, "Gives reddish-orange glow in high-voltage discharge signs."),
        PeriodicElement(11, "Na", "Sodium", 22.990, "Alkali Metal", "#EF4444", 3, 1, "[Ne] 3s¹", 0.93, "Soft, silvery-white reactive metal forming ubiquitous salt NaCl."),
        PeriodicElement(12, "Mg", "Magnesium", 24.305, "Alkaline Earth", "#F59E0B", 3, 2, "[Ne] 3s²", 1.31, "Shiny gray solid, central cofactor in chlorophyll and ATP binding."),
        PeriodicElement(13, "Al", "Aluminum", 26.982, "Post-Transition", "#06B6D4", 3, 13, "[Ne] 3s² 3p¹", 1.61, "Lightweight, corrosion-resistant post-transition metal."),
        PeriodicElement(14, "Si", "Silicon", 28.086, "Metalloid", "#10B981", 3, 14, "[Ne] 3s² 3p²", 1.90, "Primary building block of modern solid-state electronics and quartz."),
        PeriodicElement(15, "P", "Phosphorus", 30.974, "Nonmetal", "#38BDF8", 3, 15, "[Ne] 3s² 3p³", 2.19, "Constitutes the phosphate backbone of DNA and cellular ATP energy."),
        PeriodicElement(16, "S", "Sulfur", 32.065, "Nonmetal", "#38BDF8", 3, 16, "[Ne] 3s² 3p⁴", 2.58, "Bright yellow crystalline solid at room temperature forming disulfide bridges."),
        PeriodicElement(17, "Cl", "Chlorine", 35.453, "Halogen", "#8B5CF6", 3, 17, "[Ne] 3s² 3p⁵", 3.16, "Yellow-green diatomic gas used widely in water disinfection and synthesis."),
        PeriodicElement(18, "Ar", "Argon", 39.948, "Noble Gas", "#F43F5E", 3, 18, "[Ne] 3s² 3p⁶", null, "Third most abundant gas in atmosphere, inert shield gas in welding."),
        PeriodicElement(19, "K", "Potassium", 39.098, "Alkali Metal", "#EF4444", 4, 1, "[Ar] 4s¹", 0.82, "Crucial electrolyte for cellular membrane potential and neurotransmission."),
        PeriodicElement(20, "Ca", "Calcium", 40.078, "Alkaline Earth", "#F59E0B", 4, 2, "[Ar] 4s²", 1.00, "Vital structural component of bones, teeth, and cellular signaling."),
        PeriodicElement(26, "Fe", "Iron", 55.845, "Transition Metal", "#F97316", 4, 8, "[Ar] 3d⁶ 4s²", 1.83, "Most abundant element on Earth by mass, central core of hemoglobin."),
        PeriodicElement(29, "Cu", "Copper", 63.546, "Transition Metal", "#F97316", 4, 11, "[Ar] 3d¹⁰ 4s¹", 1.90, "Soft, malleable metal with exceptionally high thermal and electrical conductivity."),
        PeriodicElement(30, "Zn", "Zinc", 65.380, "Transition Metal", "#F97316", 4, 12, "[Ar] 3d¹⁰ 4s²", 1.65, "Essential trace element required for function of over 300 enzymes."),
        PeriodicElement(35, "Br", "Bromine", 79.904, "Halogen", "#8B5CF6", 4, 17, "[Ar] 3d¹⁰ 4s² 4p⁵", 2.96, "Reddish-brown liquid halogen that readily evaporates at room temperature."),
        PeriodicElement(47, "Ag", "Silver", 107.87, "Transition Metal", "#F97316", 5, 11, "[Kr] 4d¹⁰ 5s¹", 1.93, "Possesses highest electrical and thermal conductivity of any metal."),
        PeriodicElement(53, "I", "Iodine", 126.90, "Halogen", "#8B5CF6", 5, 17, "[Kr] 4d¹⁰ 5s² 5p⁵", 2.66, "Heaviest essential mineral nutrient, critical for thyroid hormone synthesis."),
        PeriodicElement(79, "Au", "Gold", 196.97, "Transition Metal", "#F97316", 6, 11, "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", 2.54, "Dense noble metal prized for unreactive brilliance and high corrosion resistance."),
        PeriodicElement(80, "Hg", "Mercury", 200.59, "Transition Metal", "#F97316", 6, 12, "[Xe] 4f¹⁴ 5d¹⁰ 6s²", 2.00, "Only metallic element that is liquid at standard temperature and pressure."),
        PeriodicElement(92, "U", "Uranium", 238.03, "Actinide", "#D946EF", 7, 6, "[Rn] 5f³ 6d¹ 7s²", 1.38, "Heavy actinide capable of sustaining nuclear fission chain reactions.")
    )

    fun onSearchChange(q: String) { _uiState.value = _uiState.value.copy(searchQuery = q) }
    fun onCategoryChange(c: String) { _uiState.value = _uiState.value.copy(selectedCategory = c) }
    fun selectElement(e: PeriodicElement?) { _uiState.value = _uiState.value.copy(selectedElement = e) }

    fun getFilteredElements(): List<PeriodicElement> {
        val q = _uiState.value.searchQuery.trim().lowercase()
        val cat = _uiState.value.selectedCategory
        return allElements.filter { el ->
            val matchCat = cat == "All" || el.category.equals(cat, ignoreCase = true)
            val matchQuery = q.isEmpty() ||
                    el.symbol.lowercase().contains(q) ||
                    el.name.lowercase().contains(q) ||
                    el.z.toString() == q
            matchCat && matchQuery
        }
    }
}
