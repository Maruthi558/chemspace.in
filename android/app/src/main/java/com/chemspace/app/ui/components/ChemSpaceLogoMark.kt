package com.chemspace.app.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.chemspace.app.ui.theme.ChemSpaceEmeraldAccent
import com.chemspace.app.ui.theme.ChemSpaceOrangeLight
import com.chemspace.app.ui.theme.ChemSpaceOrangePrimary
import kotlin.math.cos
import kotlin.math.sin

/**
 * Native Jetpack Compose implementation of the official ChemSpace logo.
 * Exactly mirrors src/components/ChemSpaceLogo.jsx:
 * - Hexagonal molecular ring
 * - Tilted orbital ellipse (-28 deg)
 * - Central Emerald Nucleus with white highlight
 * - Valence orbiting particles
 */
@Composable
fun ChemSpaceLogoMark(
    modifier: Modifier = Modifier,
    size: Dp = 64.dp,
    animated: Boolean = false,
    hexagonColor: Color = ChemSpaceOrangePrimary,
    orbitColor: Color = ChemSpaceOrangeLight,
    nucleusColor: Color = ChemSpaceEmeraldAccent
) {
    val infiniteTransition = rememberInfiniteTransition(label = "molecular_spin")
    val orbitAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 8000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "orbit_rotation"
    )

    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size)) {
            val w = this.size.width
            val h = this.size.height
            val scale = w / 32f

            val strokeHex = 1.5f * scale
            val strokeOrbit = 1.2f * scale

            // 1. Outer Benzene / Hexagonal Carbon Ring
            val hexPath = Path().apply {
                moveTo(16f * scale, 3f * scale)
                lineTo(27.5f * scale, 9.5f * scale)
                lineTo(27.5f * scale, 22.5f * scale)
                lineTo(16f * scale, 29f * scale)
                lineTo(4.5f * scale, 22.5f * scale)
                lineTo(4.5f * scale, 9.5f * scale)
                close()
            }

            drawPath(
                path = hexPath,
                color = hexagonColor,
                style = Stroke(
                    width = strokeHex,
                    cap = StrokeCap.Round,
                    join = StrokeJoin.Round
                )
            )

            // Corner vertex molecular nodes
            val vertices = listOf(
                Offset(16f * scale, 3f * scale),
                Offset(27.5f * scale, 9.5f * scale),
                Offset(27.5f * scale, 22.5f * scale),
                Offset(16f * scale, 29f * scale),
                Offset(4.5f * scale, 22.5f * scale),
                Offset(4.5f * scale, 9.5f * scale)
            )
            for (vertex in vertices) {
                drawCircle(
                    color = hexagonColor.copy(alpha = 0.85f),
                    radius = 1.2f * scale,
                    center = vertex
                )
            }

            // 2. Tilted Electron Orbital Ellipse
            rotate(degrees = -28f, pivot = Offset(16f * scale, 16f * scale)) {
                val rx = 10.5f * scale
                val ry = 4.2f * scale
                val topLeft = Offset(16f * scale - rx, 16f * scale - ry)
                val ellipseSize = Size(rx * 2, ry * 2)

                drawOval(
                    color = orbitColor.copy(alpha = 0.9f),
                    topLeft = topLeft,
                    size = ellipseSize,
                    style = Stroke(width = strokeOrbit)
                )

                // Orbiting electron particles
                val angleRad = if (animated) Math.toRadians(orbitAngle.toDouble()) else Math.toRadians(45.0)
                val ex = 16f * scale + rx * cos(angleRad).toFloat()
                val ey = 16f * scale + ry * sin(angleRad).toFloat()

                drawCircle(
                    color = Color.White,
                    radius = 1.5f * scale,
                    center = Offset(ex, ey)
                )

                val oppRad = angleRad + Math.PI
                val ox = 16f * scale + rx * cos(oppRad).toFloat()
                val oy = 16f * scale + ry * sin(oppRad).toFloat()

                drawCircle(
                    color = ChemSpaceOrangeLight,
                    radius = 1.3f * scale,
                    center = Offset(ox, oy)
                )
            }

            // 3. Central Emerald Nucleus
            val nucleusCenter = Offset(16f * scale, 16f * scale)
            drawCircle(
                color = nucleusColor,
                radius = 3.6f * scale,
                center = nucleusCenter
            )

            // Inner highlight specular glint
            drawCircle(
                color = Color.White.copy(alpha = 0.9f),
                radius = 1.1f * scale,
                center = Offset(15f * scale, 15f * scale)
            )
        }
    }
}
