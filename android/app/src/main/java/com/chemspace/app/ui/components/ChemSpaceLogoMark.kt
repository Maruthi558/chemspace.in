package com.chemspace.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.chemspace.app.ui.theme.ChemSpaceEmerald
import com.chemspace.app.ui.theme.ChemSpaceOrange

@Composable
fun ChemSpaceLogoMark(
    modifier: Modifier = Modifier,
    size: Dp = 40.dp
) {
    Canvas(modifier = modifier.size(size)) {
        val center = Offset(this.size.width / 2f, this.size.height / 2f)
        val radius = this.size.minDimension / 2f

        // Outer Hexagonal Molecular Ring
        drawCircle(
            color = ChemSpaceOrange.copy(alpha = 0.25f),
            radius = radius * 0.9f,
            style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
        )

        // Inner Orbital Ring
        drawCircle(
            color = ChemSpaceEmerald.copy(alpha = 0.5f),
            radius = radius * 0.65f,
            style = Stroke(width = 1.5.dp.toPx(), cap = StrokeCap.Round)
        )

        // Central Atomic Nucleus
        drawCircle(
            color = ChemSpaceOrange,
            radius = radius * 0.28f
        )

        // Orbital valence electrons
        val electronAngle1 = 45.0 * Math.PI / 180.0
        val electronAngle2 = 165.0 * Math.PI / 180.0
        val electronAngle3 = 285.0 * Math.PI / 180.0

        val e1 = Offset(
            (center.x + radius * 0.65f * Math.cos(electronAngle1)).toFloat(),
            (center.y + radius * 0.65f * Math.sin(electronAngle1)).toFloat()
        )
        val e2 = Offset(
            (center.x + radius * 0.65f * Math.cos(electronAngle2)).toFloat(),
            (center.y + radius * 0.65f * Math.sin(electronAngle2)).toFloat()
        )
        val e3 = Offset(
            (center.x + radius * 0.9f * Math.cos(electronAngle3)).toFloat(),
            (center.y + radius * 0.9f * Math.sin(electronAngle3)).toFloat()
        )

        drawCircle(color = Color.White, radius = 3.dp.toPx(), center = e1)
        drawCircle(color = ChemSpaceEmerald, radius = 3.dp.toPx(), center = e2)
        drawCircle(color = ChemSpaceOrange, radius = 3.5.dp.toPx(), center = e3)
    }
}
