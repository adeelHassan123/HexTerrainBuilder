import * as THREE from 'three';
import { useMapStore } from "@/store/useMapStore"

type ExportFormat = 'woocommerce' | 'json' | 'glb' | 'png'

export function useExport() {
  const { tiles, assets, tableSize, projectName } = useMapStore()
  
  // Generate a unique filename with timestamp
  const getFilename = (extension: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    return `${projectName || 'hexmap'}-${timestamp}.${extension}`
  }
  
  // Export to WooCommerce CSV format
  const exportToWooCommerce = () => {
    const headers = [
      'Type', 'SKU', 'Name', 'Published', 'Is featured?', 'Visibility in catalog', 'Short description',
      'Description', 'Date sale price starts', 'Date sale price ends', 'Tax status', 'Tax class',
      'In stock?', 'Stock', 'Backorders allowed?', 'Sold individually?', 'Weight (kg)', 'Length (cm)',
      'Width (cm)', 'Height (cm)', 'Allow customer reviews?', 'Purchase note', 'Sale price',
      'Regular price', 'Categories', 'Tags', 'Shipping class', 'Images', 'Download limit',
      'Download expiry days', 'Parent', 'Grouped products', 'Upsells', 'Cross-sells',
      'External URL', 'Button text', 'Position', 'Attribute 1 name', 'Attribute 1 value(s)',
      'Attribute 1 visible', 'Attribute 1 global', 'Attribute 2 name', 'Attribute 2 value(s)',
      'Attribute 2 visible', 'Attribute 2 global', 'Meta: _custom_field_name', 'Download 1 name',
      'Download 1 URL', 'Download 2 name', 'Download 2 URL'
    ]
    
    // Group tiles by height
    const tileGroups = Array.from(tiles.values()).reduce<Record<string, number>>((acc, tile) => {
      const key = `Hex Tile (${tile.height}")`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    
    // Group assets by type
    const assetGroups = Array.from(assets.values()).reduce<Record<string, number>>((acc, asset) => {
      const name = asset.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})
    
    // Create CSV rows
    const rows = [
      // Header row
      headers.join(','),
      
      // Tiles
      ...Object.entries(tileGroups).map(([name, quantity]) => {
        const price = (() => {
          if (name.includes('1"')) return '4.99'
          if (name.includes('2"')) return '9.99'
          if (name.includes('5"')) return '19.99'
          return '4.99'
        })()
        
        return [
          'simple', // Type
          `HEX-${name.replace(/\s+/g, '-').toUpperCase()}`, // SKU
          name, // Name
          '1', // Published
          '0', // Is featured?
          'visible', // Visibility
          `Custom ${name.toLowerCase()} for your tabletop game.`, // Short description
          `This is a high-quality ${name.toLowerCase()} for your tabletop gaming needs.`, // Description
          '', // Date sale price starts
          '', // Date sale price ends
          'taxable', // Tax status
          '', // Tax class
          '1', // In stock?
          quantity > 1 ? quantity.toString() : '100', // Stock
          '0', // Backorders allowed?
          '0', // Sold individually?
          '0.1', // Weight (kg)
          '5', // Length (cm)
          '5', // Width (cm)
          '5', // Height (cm)
          '1', // Allow customer reviews?
          '', // Purchase note
          price, // Sale price
          (parseFloat(price) * 1.2).toFixed(2), // Regular price
          'Hex Tiles', // Categories
          'terrain,hex,tile', // Tags
          '', // Shipping class
          '', // Images
          '', // Download limit
          '', // Download expiry days
          '', // Parent
          '', // Grouped products
          '', // Upsells
          '', // Cross-sells
          '', // External URL
          '', // Button text
          '0', // Position
          'Material', // Attribute 1 name
          'Plastic', // Attribute 1 value(s)
          '1', // Attribute 1 visible
          '1', // Attribute 1 global
          'Color', // Attribute 2 name
          'Gray', // Attribute 2 value(s)
          '1', // Attribute 2 visible
          '1', // Attribute 2 global
        ].join(',')
      }),
      
      // Assets
      ...Object.entries(assetGroups).map(([name, quantity]) => {
        const type = name.split(' ')[0].toLowerCase()
        const price = (() => {
          if (type === 'tree') return '2.99'
          if (type === 'rock') return '3.99'
          if (type === 'building') return '7.99'
          return '1.99'
        })()
        
        return [
          'simple', // Type
          `ASSET-${name.replace(/\s+/g, '-').toUpperCase()}`, // SKU
          name, // Name
          '1', // Published
          '0', // Is featured?
          'visible', // Visibility
          `Custom ${name.toLowerCase()} for your tabletop game.`, // Short description
          `This is a detailed ${name.toLowerCase()} to enhance your tabletop gaming experience.`, // Description
          '', // Date sale price starts
          '', // Date sale price ends
          'taxable', // Tax status
          '', // Tax class
          '1', // In stock?
          quantity > 1 ? quantity.toString() : '50', // Stock
          '0', // Backorders allowed?
          '0', // Sold individually?
          '0.05', // Weight (kg)
          '3', // Length (cm)
          '3', // Width (cm)
          '3', // Height (cm)
          '1', // Allow customer reviews?
          '', // Purchase note
          price, // Sale price
          (parseFloat(price) * 1.2).toFixed(2), // Regular price
          'Assets', // Categories
          'terrain,asset,scatter', // Tags
          '', // Shipping class
          '', // Images
          '', // Download limit
          '', // Download expiry days
          '', // Parent
          '', // Grouped products
          '', // Upsells
          '', // Cross-sells
          '', // External URL
          '', // Button text
          '0', // Position
          'Material', // Attribute 1 name
          'Resin', // Attribute 1 value(s)
          '1', // Attribute 1 visible
          '1', // Attribute 1 global
          'Color', // Attribute 2 name
          'Painted', // Attribute 2 value(s)
          '1', // Attribute 2 visible
          '1', // Attribute 2 global
        ].join(',')
      })
    ]
    
    // Create CSV content
    const csvContent = rows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    // Trigger download
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', getFilename('csv'))
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Export to GLB format (placeholder - would need Three.js GLTFExporter)
  const exportToGLB = async () => {
    // This would use Three.js GLTFExporter in a real implementation
    alert('GLB export would be implemented here with Three.js GLTFExporter')
    
    // Example of what this might look like:
    /*
    const exporter = new GLTFExporter()
    exporter.parse(scene, (glb) => {
      const blob = new Blob([glb], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = getFilename('glb')
      link.click()
    }, { binary: true })
    */
  }
  
  // Export to PNG (screenshot)
  const exportToPNG = (renderer: THREE.WebGLRenderer) => {
    const dataURL = renderer.domElement.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataURL
    link.download = getFilename('png')
    link.click()
  }
  
  // Export to JSON
  const exportToJSON = () => {
    const data = {
      metadata: {
        name: projectName,
        version: '1.0',
        date: new Date().toISOString(),
        tileCount: tiles.size,
        assetCount: assets.size
      },
      settings: {
        tableSize,
        gridSize: 1,
        units: 'inches'
      },
      tiles: Array.from(tiles.values()).map(t => ({
        ...t,
        position: { q: t.q, r: t.r },
        height: t.height
      })),
      assets: Array.from(assets.values()).map(a => ({
        ...a,
        position: { q: a.q, r: a.r },
        type: a.type,
        rotation: { y: a.rotationY }
      }))
    }
    
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const link = document.createElement('a')
    link.setAttribute('href', dataUri)
    link.setAttribute('download', getFilename('json'))
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Main export function
  const exportMap = (format: ExportFormat, renderer?: THREE.WebGLRenderer) => {
    try {
      switch (format) {
        case 'woocommerce':
          exportToWooCommerce()
          break
        case 'json':
          exportToJSON()
          break
        case 'glb':
          exportToGLB()
          break
        case 'png':
          if (renderer) exportToPNG(renderer)
          else console.error('Renderer not provided for PNG export')
          break
        default:
          console.error('Unsupported export format:', format)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  return {
    exportMap,
    formats: ['woocommerce', 'json', 'glb', 'png'] as const
  }
}
