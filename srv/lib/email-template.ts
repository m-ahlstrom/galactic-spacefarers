interface WelcomeEmailData {
    name: string
    email: string
    age: number
    originPlanetName: string
    destinationPlanetName: string
    departmentName: string
    positionTitle: string
    stardustCollection: number
    wormholeNavigationSkill: number
    spacesuitColor: string
}

const spacesuitGradients: Record<string, string> = {
    'cosmic blue': 'linear-gradient(135deg, #1e3c72, #2a5298)',
    crimson: 'linear-gradient(135deg, #7f1d1d, #b91c1c)',
    silver: 'linear-gradient(135deg, #64748b, #94a3b8)',
    emerald: 'linear-gradient(135deg, #065f46, #10b981)',
    'solar gold': 'linear-gradient(135deg, #92400e, #eab308)',
    'nebula purple': 'linear-gradient(135deg, #3a1c71, #6a0dad)',
    'void black': 'linear-gradient(135deg, #0f0f0f, #2c2c2c)',
    'ivory white': 'linear-gradient(135deg, #94a3b8, #e2e8f0)',
    'rose gold': 'linear-gradient(135deg, #b76e79, #e8b4bc)',
    'solar pink': 'linear-gradient(135deg, #be185d, #f472b6)',
}

const defaultGradient = 'linear-gradient(135deg, #3a1c71, #6a0dad, #1e3c72)'

function headerGradientFor(spacesuitColor: string): string {
    return (
        spacesuitGradients[spacesuitColor.trim().toLowerCase()] ??
        defaultGradient
    )
}

export default function buildWelcomeEmailHtml(data: WelcomeEmailData): string {
    const headerGradient = headerGradientFor(data.spacesuitColor)

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Welcome aboard</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5fa; font-family: 'Segoe UI', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5fa; padding: 32px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#141a2e; border-radius:12px; overflow:hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.25);">
                    <tr>
                        <td style="background: ${headerGradient}; padding: 32px 24px; text-align:center;">
                            <h1 style="color:#ffffff; font-size:22px; margin: 12px 0 0;">Welcome aboard, ${escapeHtml(data.name)}!</h1>
                            <p style="color:rgba(255,255,255,0.85); font-size:13px; margin: 6px 0 0;">Spacesuit: ${escapeHtml(data.spacesuitColor)}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 28px 24px; color:#d7dcff;">
                            <p style="font-size:15px; line-height:1.6; margin: 0 0 16px; color:#c3c9f0;">
                                Your cosmic journey has been cleared for launch. Here are your details:
                            </p>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
                                ${row('Age', String(data.age))}
                                ${row('Department', data.departmentName)}
                                ${row('Position', data.positionTitle)}
                                ${row('Origin Planet', data.originPlanetName)}
                                ${row('Destination Planet', data.destinationPlanetName)}
                                ${row('Wormhole Navigation Skill', `${data.wormholeNavigationSkill} / 100`)}
                                ${row('Stardust Collected', data.stardustCollection.toLocaleString(), true)}
                            </table>
                            <p style="font-size:14px; line-height:1.6; color:#9aa4d1; margin: 20px 0 0;">
                                Safe travels among the stars. Mission Control is monitoring your journey.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 24px; background-color:#0e1326; text-align:center;">
                            <span style="font-size:11px; color:#5c6494;">Galactic Spacefarers Mission Control</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`.trim()
}

function row(label: string, value: string, last = false): string {
    const borderStyle = last ? '' : 'border-bottom: 1px solid #2a3152;'
    return `
    <tr>
        <td style="padding: 8px 0; ${borderStyle} color:#9aa4d1; font-size:13px;">${escapeHtml(label)}</td>
        <td style="padding: 8px 0; ${borderStyle} text-align:right; font-weight:600; color:#ffffff;">${escapeHtml(value)}</td>
    </tr>`
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}
