package com.chemspace.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chemspace.app.ui.theme.ChemSpaceBorderDark
import com.chemspace.app.ui.theme.ChemSpaceEmeraldAccent
import com.chemspace.app.ui.theme.ChemSpaceError
import com.chemspace.app.ui.theme.ChemSpaceOrangeDark
import com.chemspace.app.ui.theme.ChemSpaceOrangeLight
import com.chemspace.app.ui.theme.ChemSpaceOrangePrimary
import com.chemspace.app.ui.theme.ChemSpaceSurfaceDark
import com.chemspace.app.ui.theme.ChemSpaceSurfaceElevatedDark

enum class ButtonVariant {
    PRIMARY,
    SECONDARY,
    OUTLINE,
    GHOST,
    DANGER
}

enum class ButtonState {
    NORMAL,
    LOADING,
    SUCCESS,
    ERROR
}

@Composable
fun ChemSpaceButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonVariant = ButtonVariant.PRIMARY,
    state: ButtonState = ButtonState.NORMAL,
    enabled: Boolean = true,
    height: Dp = 48.dp,
    leadingIcon: @Composable (() -> Unit)? = null,
    trailingIcon: @Composable (() -> Unit)? = null
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()

    val isInteractive = enabled && state == ButtonState.NORMAL

    val shape = RoundedCornerShape(10.dp)

    // Scientific sleek palette
    val (backgroundBrush, contentColor, borderStroke) = when (variant) {
        ButtonVariant.PRIMARY -> {
            val brush = when {
                !enabled -> Brush.horizontalGradient(listOf(Color(0xFF374151), Color(0xFF374151)))
                state == ButtonState.SUCCESS -> Brush.horizontalGradient(listOf(ChemSpaceEmeraldAccent, Color(0xFF059669)))
                state == ButtonState.ERROR -> Brush.horizontalGradient(listOf(ChemSpaceError, Color(0xFFB91C1C)))
                isPressed -> Brush.horizontalGradient(listOf(ChemSpaceOrangeDark, ChemSpaceOrangePrimary))
                else -> Brush.horizontalGradient(listOf(ChemSpaceOrangePrimary, ChemSpaceOrangeLight))
            }
            Triple(brush, Color.White, null)
        }
        ButtonVariant.SECONDARY -> {
            val brush = when {
                !enabled -> Brush.horizontalGradient(listOf(Color(0xFF263040), Color(0xFF263040)))
                state == ButtonState.SUCCESS -> Brush.horizontalGradient(listOf(ChemSpaceEmeraldAccent.copy(alpha = 0.2f), ChemSpaceEmeraldAccent.copy(alpha = 0.2f)))
                isPressed -> Brush.horizontalGradient(listOf(ChemSpaceSurfaceElevatedDark, ChemSpaceSurfaceElevatedDark))
                else -> Brush.horizontalGradient(listOf(ChemSpaceSurfaceDark, ChemSpaceSurfaceDark))
            }
            val border = BorderStroke(1.dp, if (enabled) ChemSpaceBorderDark else Color(0xFF374151))
            Triple(brush, if (enabled) Color(0xFFF3F4F6) else Color(0xFF6B7280), border)
        }
        ButtonVariant.OUTLINE -> {
            val brush = Brush.horizontalGradient(listOf(Color.Transparent, Color.Transparent))
            val borderColor = when {
                !enabled -> Color(0xFF374151)
                isPressed -> ChemSpaceOrangeLight
                else -> ChemSpaceOrangePrimary
            }
            Triple(brush, if (enabled) ChemSpaceOrangeLight else Color(0xFF6B7280), BorderStroke(1.dp, borderColor))
        }
        ButtonVariant.GHOST -> {
            val brush = Brush.horizontalGradient(listOf(Color.Transparent, Color.Transparent))
            Triple(brush, if (enabled) Color(0xFFE5E7EB) else Color(0xFF6B7280), null)
        }
        ButtonVariant.DANGER -> {
            val brush = Brush.horizontalGradient(listOf(ChemSpaceError, Color(0xFFB91C1C)))
            Triple(brush, Color.White, null)
        }
    }

    Box(
        modifier = modifier
            .height(height)
            .clip(shape)
            .then(
                if (borderStroke != null) Modifier.background(Color.Transparent).then(Modifier.background(Brush.horizontalGradient(listOf(Color.Transparent, Color.Transparent))))
                else Modifier
            )
            .background(backgroundBrush, shape)
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                enabled = isInteractive,
                onClick = onClick
            )
            .padding(horizontal = 16.dp),
        contentAlignment = Alignment.Center
    ) {
        if (state == ButtonState.LOADING) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                color = contentColor,
                strokeWidth = 2.dp
            )
        } else {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                if (leadingIcon != null) {
                    leadingIcon()
                    Spacer(modifier = Modifier.width(8.dp))
                }

                Text(
                    text = when (state) {
                        ButtonState.SUCCESS -> "Success"
                        ButtonState.ERROR -> "Failed"
                        else -> text
                    },
                    color = contentColor,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    textAlign = TextAlign.Center
                )

                if (trailingIcon != null) {
                    Spacer(modifier = Modifier.width(8.dp))
                    trailingIcon()
                }
            }
        }
    }
}
