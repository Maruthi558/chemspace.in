package com.chemspace.app.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import com.chemspace.app.ui.theme.ChemSpaceEmeraldAccent
import com.chemspace.app.ui.theme.ChemSpaceOrangePrimary
import kotlin.math.hypot
import kotlin.math.sin
import kotlin.random.Random

private data class MolecularNode(
    val initialXRatio: Float,
    val initialYRatio: Float,
    val radius: Float,
    val color: Color,
    val phase: Float,
    val speed: Float
)

@Composable
fun MolecularBackgroundCanvas(
    modifier: Modifier = Modifier,
    particleCount: Int = 18,
    connectionDistanceDp: Float = 110f,
    isAnimated: Boolean = true
) {
    val nodes = remember {
        val rand = Random(42) // Stable seed so particles don't randomly jump on recomposition
        List(particleCount) { i ->
            val color = when (i % 3) {
                0 -> ChemSpaceOrangePrimary.copy(alpha = 0.35f)
                1 -> ChemSpaceEmeraldAccent.copy(alpha = 0.35f)
                else -> Color(0xFF38BDF8).copy(alpha = 0.25f)
            }
            MolecularNode(
                initialXRatio = rand.nextFloat(),
                initialYRatio = rand.nextFloat(),
                radius = 2.5f + rand.nextFloat() * 3.5f,
                color = color,
                phase = rand.nextFloat() * 6.28f,
                speed = 0.5f + rand.nextFloat() * 0.8f
            )
        }
    }

    val infiniteTransition = rememberInfiniteTransition(label = "molecular_drift")
    val time by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 6.28318f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 18000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "time_flow"
    )

    Canvas(modifier = modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height
        val maxDist = connectionDistanceDp * density

        val currentPositions = nodes.map { node ->
            val driftX = if (isAnimated) sin(time * node.speed + node.phase) * 22f else 0f
            val driftY = if (isAnimated) sin(time * node.speed * 0.7f + node.phase) * 18f else 0f
            Offset(
                x = (node.initialXRatio * width + driftX).coerceIn(0f, width),
                y = (node.initialYRatio * height + driftY).coerceIn(0f, height)
            )
        }

        // Draw molecular covalent bonds (lines between nearby nodes)
        for (i in currentPositions.indices) {
            for (j in i + 1 until currentPositions.size) {
                val p1 = currentPositions[i]
                val p2 = currentPositions[j]
                val dist = hypot(p1.x - p2.x, p1.y - p2.y)

                if (dist < maxDist) {
                    val alpha = (1f - dist / maxDist) * 0.18f
                    drawLine(
                        color = Color.White.copy(alpha = alpha),
                        start = p1,
                        end = p2,
                        strokeWidth = 1.2f,
                        cap = StrokeCap.Round
                    )
                }
            }
        }

        // Draw atom vertices
        for (i in nodes.indices) {
            val node = nodes[i]
            val pos = currentPositions[i]
            drawCircle(
                color = node.color,
                radius = node.radius * density,
                center = pos
            )
            // Tiny core
            drawCircle(
                color = Color.White.copy(alpha = 0.5f),
                radius = (node.radius * 0.4f) * density,
                center = pos
            )
        }
    }
}
