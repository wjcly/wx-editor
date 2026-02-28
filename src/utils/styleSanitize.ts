/**
 * WeChat style sanitizer utility
 * Removes unsupported CSS properties and values that WeChat's content filter strips
 * Uses a blacklist mechanism to disallow specific properties/values
 * Allows most CSS properties while filtering out known problematic ones
 */

// List of disallowed CSS properties for WeChat
const DISALLOWED_CSS_PROPERTIES = [
  // WeChat incompatible properties
  `behavior`,
  `-webkit-appearance`,
  `-moz-appearance`,
  `-ms-high-contrast-adjust`,

  // Potentially dangerous properties
  // We allow 'content' property as it's needed in many cases, but filter dangerous values
]

// Values that are not supported by WeChat and should be removed
const UNSUPPORTED_VALUES = [
  `var\\\\([^)]*\\\\)`, // CSS variables like var(--color)
  `backdrop-filter`,
  `webkit-backdrop-filter`,
]

/**
 * Sanitizes inline styles for WeChat compatibility
 * @param styleValue The style attribute value to sanitize
 * @returns Sanitized style string safe for WeChat
 */
export function sanitizeInlineStyles(styleValue: string): string {
  if (!styleValue)
    return ``

  // First, extract CSS variable definitions
  const variableDefinitions: Record<string, string> = {}

  // Find and store CSS variable definitions
  const styleWithoutVars = styleValue.replace(/(--[\w-]+):\s*([^;}]*)/g, (_match: string, varName: string, varValue: string) => {
    if (varName.startsWith(`--`)) {
      variableDefinitions[varName] = varValue.trim()
    }
    // Remove the variable definition from the style string
    return ``
  })

  // Process the style string, replacing var() references with their values
  let processedStyle = styleWithoutVars

  // Replace var() references with their defined values or fallbacks
  processedStyle = processedStyle.replace(/var\([^)]*\)/g, (match: string) => {
    // Parse var() function manually to avoid regex backtracking issues
    const content = match.substring(4, match.length - 1) // Get content between 'var(' and ')'
    const parts = content.split(`,`)
    const variableName = parts[0].trim()
    const fallback = parts.length > 1 ? parts.slice(1).join(`,`).trim() : undefined

    if (variableDefinitions[variableName]) {
      return variableDefinitions[variableName] // Use the defined variable value
    }
    else if (fallback) {
      return fallback // Use fallback value if variable is not defined
    }
    // If neither variable nor fallback exists, return empty string
    return ``
  })

  // Clean up any empty or invalid function calls (like gradient with empty params)
  // But preserve valid SVG and image functions like polygon, circle, ellipse, image, etc.
  processedStyle = processedStyle.replace(/([\w-]+)\(\s*\)/g, (match: string, functionName: string) => {
    // Allow specific SVG and image functions to pass through even if empty
    const allowedEmptyFunctions = [`polygon`, `circle`, `ellipse`, `inset`, `rect`, `path`, `image`, `image-set`]
    if (allowedEmptyFunctions.includes(functionName.toLowerCase())) {
      return match // Keep the function even if empty
    }
    return `` // Remove other empty functions
  })

  // Split the style string into individual declarations
  const declarations = processedStyle.split(`;`).filter((decl: string) => decl.trim() !== ``)
  const sanitizedDeclarations: string[] = []

  for (const declaration of declarations) {
    const [property, value] = declaration.split(`:`)
    if (!property || !value)
      continue

    const prop = property.trim().toLowerCase()
    const val = value.trim()

    // Skip if value is empty after processing
    if (!val)
      continue

    // Check if property is in the disallowed list
    if (DISALLOWED_CSS_PROPERTIES.includes(prop)) {
      continue
    }

    // Skip if value contains unsupported patterns
    let isUnsupported = false
    for (const unsupportedValue of UNSUPPORTED_VALUES) {
      if (new RegExp(unsupportedValue, `i`).test(val)) {
        isUnsupported = true
        break
      }
    }

    if (isUnsupported) {
      continue
    }

    // Special handling for font-family to only allow safe fonts
    if (prop === `font-family`) {
      const fonts = val.split(`,`).map((f: string) => f.trim())
      const safeFonts = fonts.filter((font: string) => {
        // Remove quotes for comparison
        const cleanFont = font.replace(/['"]/g, ``).trim()
        // Allow only WeChat-supported fonts
        const safeFontNames = [
          `mp-quote`,
          `-apple-system-font`,
          `BlinkMacSystemFont`,
          `Helvetica Neue`,
          `PingFang SC`,
          `Hiragino Sans GB`,
          `Microsoft YaHei UI`,
          `Microsoft YaHei`,
          `Roboto`,
          `Arial`,
          `sans-serif`,
        ]
        return safeFontNames.some((safe: string) => cleanFont.toLowerCase().includes(safe.toLowerCase()))
      })

      if (safeFonts.length === 0) {
        // If no safe fonts found, default to a common safe font
        sanitizedDeclarations.push(`${prop}: sans-serif`)
        continue
      }

      // Use only safe fonts
      sanitizedDeclarations.push(`${prop}: ${safeFonts.join(`, `)}`)
      continue
    }

    // Add the sanitized declaration
    sanitizedDeclarations.push(`${prop}: ${val}`)
  }

  return sanitizedDeclarations.join(`; `)
}

/**
 * Sanitizes all style attributes in HTML content for WeChat compatibility
 * @param htmlContent The HTML content to sanitize
 * @returns Sanitized HTML content safe for WeChat
 */
export function sanitizeHtmlStyles(htmlContent: string): string {
  if (!htmlContent)
    return htmlContent

  // Replace all style attributes with sanitized versions
  // Use a more robust regex that handles multi-line styles
  return htmlContent.replace(/style=(["'])([\s\S]*?)\1/g, (_match: string, quote: string, styleValue: string) => {
    const sanitizedStyle = sanitizeInlineStyles(styleValue)
    return sanitizedStyle ? `style=${quote}${sanitizedStyle}${quote}` : ``
  })
}

/**
 * Sanitizes CSS in style tags for WeChat compatibility
 * @param cssContent The CSS content inside style tags to sanitize
 * @returns Sanitized CSS content safe for WeChat
 */
function sanitizeStyleTagContent(cssContent: string): string {
  if (!cssContent)
    return cssContent

  // Process CSS rules to remove unsupported properties
  return cssContent.replace(/([^{]+)\{([^}]*)\}/g, (_match: string, selector: string, ruleBody: string) => {
    // Split rule body into individual property declarations
    const declarations = ruleBody.split(`;`).filter((decl: string) => decl.trim() !== ``)
    const sanitizedDeclarations: string[] = []

    for (const declaration of declarations) {
      const [property, value] = declaration.split(`:`)
      if (!property || !value)
        continue

      const prop = property.trim().toLowerCase()
      const val = value.trim()

      // Skip if value is empty after processing
      if (!val)
        continue

      // Check if property is in the disallowed list
      if (DISALLOWED_CSS_PROPERTIES.includes(prop)) {
        continue
      }

      // Skip if value contains unsupported patterns
      let isUnsupported = false
      for (const unsupportedValue of UNSUPPORTED_VALUES) {
        if (new RegExp(unsupportedValue, `i`).test(val)) {
          isUnsupported = true
          break
        }
      }

      if (isUnsupported) {
        continue
      }

      // Add the sanitized declaration
      sanitizedDeclarations.push(`${prop}: ${val}`)
    }

    if (sanitizedDeclarations.length === 0) {
      // If no declarations are valid, return empty string to remove the entire rule
      return ``
    }

    return `${selector}{${sanitizedDeclarations.join(`; `)}}`
  })
}

/**
 * Sanitizes all style tags in HTML content for WeChat compatibility
 * @param htmlContent The HTML content to sanitize
 * @returns Sanitized HTML content safe for WeChat
 */
function sanitizeStyleTags(htmlContent: string): string {
  if (!htmlContent)
    return htmlContent

  // Replace all style tags with sanitized versions
  return htmlContent.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_match: string, styleContent: string) => {
    const sanitizedStyle = sanitizeStyleTagContent(styleContent)
    return sanitizedStyle ? `<style>${sanitizedStyle}</style>` : ``
  })
}

/**
 * Sanitizes CSS variables and unsupported properties in HTML content
 * This is a more aggressive sanitizer that specifically handles the WeChat issue
 * where the presence of var(--xx) or unsupported properties causes the entire style to be stripped
 * Also handles style tags and class attributes for complete CSS sanitization.
 * @param htmlContent The HTML content to sanitize
 * @returns Sanitized HTML content safe for WeChat
 */
export function sanitizeForWechat(htmlContent: string): string {
  if (!htmlContent)
    return htmlContent

  // First sanitize style tags, then inline styles, then class attributes
  let result = sanitizeStyleTags(htmlContent)
  result = sanitizeHtmlStyles(result)
  result = sanitizeClassAttributes(result)
  return result
}

/**
 * Sanitizes class attributes in HTML elements to remove potentially problematic classes
 * @param htmlContent The HTML content to sanitize
 * @returns Sanitized HTML content with clean class attributes
 */
export function sanitizeClassAttributes(htmlContent: string): string {
  if (!htmlContent)
    return htmlContent

  // Replace all class attributes with cleaned versions
  // Currently just passes through - in the future we could filter specific class names
  // that might contain problematic characters or patterns
  return htmlContent.replace(/class=(["'])([\s\S]*?)\1/gi, (_match: string, quote: string, classValue: string) => {
    // Sanitize the class list by removing potentially problematic entries
    const classes = classValue.split(/\s+/).filter((cls: string) => {
      // Remove empty classes and any classes that might contain problematic characters
      return cls && !cls.includes(`\``) && !cls.includes(`{`) && !cls.includes(`}`)
    })

    if (classes.length === 0) {
      return `` // Remove class attribute if no valid classes remain
    }

    return `class=${quote}${classes.join(` `)}${quote}`
  })
}
