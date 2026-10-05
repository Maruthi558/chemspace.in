package com.chemspace.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chemspace.app.data.api.SpectrumDataset
import com.chemspace.app.data.api.SpectrumPeak
import com.chemspace.app.ui.theme.ChemSpaceEmerald
import com.chemspace.app.ui.theme.ChemSpaceOrange
import com.chemspace.app.ui.theme.DarkBorder
import com.chemspace.app.ui.theme.DarkSurface
import com.chemspace.app.ui.theme.DarkTextMuted

@Composable
fun SpectraChartCanvas(
    dataset: SpectrumDataset?,
    modifier: Modifier = Modifier
) {
    var selectedPeak by remember { mutableStateOf<SpectrumPeak?>(null) }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(240.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(DarkSurface)
    ) {
        if (dataset == null) {
            Text(
                text = "No spectra data loaded",
                color = DarkTextMuted,
                fontSize = 12.sp,
                modifier = Modifier.align(Alignment.Center)
            )
        } else {
            Canvas(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(start = 24.dp, end = 24.dp, top = 20.dp, bottom = 32.dp)
                    .pointerInput(dataset) {
                        detectTapGestures { tapOffset ->
                            // Hit test closest peak
                            val w = size.width
                            val h = size.height
                            val peaks = dataset.peaks ?: emptyList()
                            var bestDist = Float.MAX_VALUE
                            var bestPeak: SpectrumPeak? = null
                            for (p in peaks) {
                                val px = when (dataset.technique) {
                                    "FT-IR" -> ((4000.0 - p.x) / 3500.0 * w).toFloat()
                                    "UV-Vis" -> ((p.x - 200.0) / 250.0 * w).toFloat()
                                    "1H NMR" -> ((12.0 - p.x) / 12.0 * w).toFloat()
                                    else -> ((p.x - 10.0) / 190.0 * w).toFloat()
                                }
                                val py = when (dataset.technique) {
                                    "FT-IR" -> (p.y / 100.0 * h).toFloat()
                                    "UV-Vis" -> (h - (p.y / 2.0 * h)).toFloat()
                                    else -> (h - (p.y / 100.0 * h)).toFloat()
                                }
                                val d = kotlin.math.hypot(tapOffset.x - px, tapOffset.y - py)
                                if (d < 30.dp.toPx() && d < bestDist) {
                                    bestDist = d
                                    bestPeak = p
                                }
                            }
                            selectedPeak = bestPeak
                        }
                    }
            ) {
                val w = size.width
                val h = size.height

                // Draw background grid lines
                for (i in 0..4) {
                    val y = h * (i / 4f)
                    drawLine(
                        color = DarkBorder.copy(alpha = 0.5f),
                        start = Offset(0f, y),
                        end = Offset(w, y),
                        strokeWidth = 1.dp.toPx()
                    )
                }

                // If curve points exist (e.g. IR or UV)
                val curve = dataset.curvePoints
                if (!curve.isNullOrEmpty()) {
                    val path = Path()
                    var first = true

                    for (pt in curve) {
                        val xVal = pt[0]
                        val yVal = pt[1]

                        val xPx = when (dataset.technique) {
                            "FT-IR" -> ((4000.0 - xVal) / 3500.0 * w).toFloat()
                            "UV-Vis" -> ((xVal - 200.0) / 250.0 * w).toFloat()
                            else -> ((xVal / 200.0) * w).toFloat()
                        }

                        val yPx = when (dataset.technique) {
                            "FT-IR" -> (yVal / 100.0 * h).toFloat()
                            "UV-Vis" -> (h - (yVal / 2.0 * h)).toFloat().coerceIn(0f, h)
                            else -> (h - (yVal / 100.0 * h)).toFloat().coerceIn(0f, h)
                        }

                        if (first) {
                            path.moveTo(xPx, yPx)
                            first = false
                        } else {
                            path.lineTo(xPx, yPx)
                        }
                    }

                    drawPath(
                        path = path,
                        color = ChemSpaceOrange,
                        style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
                    )
                }

                // Draw Discrete Peaks (for NMR, Mass Spec or Peak markers)
                val peaks = dataset.peaks ?: emptyList()
                for (p in peaks) {
                    val px = when (dataset.technique) {
                        "FT-IR" -> ((4000.0 - p.x) / 3500.0 * w).toFloat()
                        "UV-Vis" -> ((p.x - 200.0) / 250.0 * w).toFloat()
                        "1H NMR" -> ((12.0 - p.x) / 12.0 * w).toFloat()
                        else -> ((p.x - 10.0) / 190.0 * w).toFloat()
                    }
                    val py = when (dataset.technique) {
                        "FT-IR" -> (p.y / 100.0 * h).toFloat()
                        "UV-Vis" -> (h - (p.y / 2.0 * h)).toFloat()
                        else -> (h - (p.y / 100.0 * h)).toFloat()
                    }

                    // Vertical impulse stem for NMR/MS
                    if (dataset.technique == "1H NMR" || dataset.technique == "EI Mass Spec") {
                        drawLine(
                            color = ChemSpaceEmerald,
                            start = Offset(px, h),
                            end = Offset(px, py),
                            strokeWidth = 2.dp.toPx()
                        )
                    }

                    // Peak marker circle
                    drawCircle(
                        color = if (selectedPeak == p) Color.White else ChemSpaceEmerald,
                        radius = if (selectedPeak == p) 6.dp.toPx() else 4.dp.toPx(),
                        center = Offset(px, py)
                    )
                }
            }

            // Technique & Axis Labels
            Text(
                text = "${dataset.technique} • ${dataset.yLabel}",
                color = DarkTextMuted,
                fontSize = 11.sp,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(8.dp)
            )

            Text(
                text = dataset.xLabel,
                color = DarkTextMuted,
                fontSize = 11.sp,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 6.dp)
            )

            // Selected Peak Info Tag
            selectedPeak?.let { p ->
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.Black.copy(alpha = 0.75f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Peak: ${p.x} (${p.assignment ?: p.intensity ?: ""})",
                        color = Color.White,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}
