export const fadeColor = (color, opacity = 0.08) => {
    if (color?.startsWith('#')) {
      // Hex color code
      const sanitizedHex = color?.replace('#', '')
  
      if (sanitizedHex?.length === 3) {
        // Convert 3-digit hex to 6-digit hex
        const [r, g, b] = sanitizedHex.split('')
        color = `#${r}${r}${g}${g}${b}${b}`
      }
  
      const red = parseInt(color?.substring(1, 3), 16)
      const green = parseInt(color?.substring(3, 5), 16)
      const blue = parseInt(color?.substring(5, 7), 16)
  
      return `rgba(${red}, ${green}, ${blue}, ${opacity})`
    } else if (color?.startsWith('rgba')) {
      // RGBA color code
      const rgbaPattern = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/
      const matches = color?.match(rgbaPattern)
  
      if (matches) {
        const red = parseInt(matches[1])
        const green = parseInt(matches[2])
        const blue = parseInt(matches[3])
  
        return `rgba(${red}, ${green}, ${blue}, ${opacity})`
      }
    }
  
    // Invalid color format
    return null
  }

export const RGBAToHexA = (rgba, forceRemoveAlpha = false) =>{
  if(rgba[0] === '#') return rgba
  return "#" + rgba.replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
    .split(',') // splits them at ","
    .filter((string, index) => !forceRemoveAlpha || index !== 3)
    .map(string => parseFloat(string)) // Converts them to numbers
    .map((number, index) => index === 3 ? Math.round(number * 255) : number) // Converts alpha to 255 number
    .map(number => number.toString(16)) // Converts numbers to hex
    .map(string => string.length === 1 ? "0" + string : string) // Adds 0 when length of one number is 1
    .join("") // Puts the array to togehter to a string
}