// Example specification data for different table types
// Use these as templates when creating product specifications

// Example 1: Simple Grid Table
export const simpleGridExample = {
  title: "Technical Specifications",
  type: "grid",
  content: {
    headers: [
      [
        { id: "h1", value: "Specification", align: "left" },
        { id: "h2", value: "Value" },
        { id: "h3", value: "Unit" }
      ]
    ],
    rows: [
      [
        { id: "r1c1", value: "Flow Rate", isHeader: true, align: "left" },
        { id: "r1c2", value: "2-4" },
        { id: "r1c3", value: "LPH" }
      ],
      [
        { id: "r2c1", value: "Working Pressure", isHeader: true, align: "left" },
        { id: "r2c2", value: "1.0-3.0" },
        { id: "r2c3", value: "Bar" }
      ],
      [
        { id: "r3c1", value: "Recommended Spacing", isHeader: true, align: "left" },
        { id: "r3c2", value: "30-60" },
        { id: "r3c3", value: "cm" }
      ]
    ]
  }
};

// Example 2: Matrix Table with Merged Headers (Like Drip Table 5)
export const matrixMergedExample = {
  title: "Maximum Recommended Length of Run",
  type: "matrix",
  content: {
    headers: [
      [
        { id: "h1", value: "Pressure (Kg/Cm²)", rowSpan: 2 },
        { id: "h2", value: "Nominal Dia. 12mm", colSpan: 5 }
      ],
      [
        // Note: First cell skipped due to rowSpan=2 above
        { id: "h3", value: "Emitter Spacing 20cm" },
        { id: "h4", value: "30 cm" },
        { id: "h5", value: "40 cm" },
        { id: "h6", value: "50 cm" },
        { id: "h7", value: "60 cm" }
      ]
    ],
    rows: [
      [
        { id: "r1c1", value: "2 LPH", isHeader: true },
        { id: "r1c2", value: 18 },
        { id: "r1c3", value: 26 },
        { id: "r1c4", value: 35 },
        { id: "r1c5", value: 44 },
        { id: "r1c6", value: 52 }
      ],
      [
        { id: "r2c1", value: "4 LPH", isHeader: true },
        { id: "r2c2", value: 13 },
        { id: "r2c3", value: 20 },
        { id: "r2c4", value: 26 },
        { id: "r2c5", value: 33 },
        { id: "r2c6", value: 39 }
      ],
      [
        { id: "r3c1", value: "8 LPH", isHeader: true },
        { id: "r3c2", value: 10 },
        { id: "r3c3", value: 15 },
        { id: "r3c4", value: 20 },
        { id: "r3c5", value: 25 },
        { id: "r3c6", value: 30 }
      ]
    ]
  }
};

// Example 3: Feature Comparison Table with Checkmarks
export const featureComparisonExample = {
  title: "Product Features",
  type: "grid",
  content: {
    headers: [
      [
        { id: "h1", value: "Feature" },
        { id: "h2", value: "Basic" },
        { id: "h3", value: "Pro" },
        { id: "h4", value: "Premium" }
      ]
    ],
    rows: [
      [
        { id: "r1c1", value: "UV Resistant", isHeader: true, align: "left" },
        { id: "r1c2", value: true },
        { id: "r1c3", value: true },
        { id: "r1c4", value: true }
      ],
      [
        { id: "r2c1", value: "Anti-Clog", isHeader: true, align: "left" },
        { id: "r2c2", value: false },
        { id: "r2c3", value: true },
        { id: "r2c4", value: true }
      ],
      [
        { id: "r3c1", value: "Self-Flushing", isHeader: true, align: "left" },
        { id: "r3c2", value: false },
        { id: "r3c3", value: false },
        { id: "r3c4", value: true }
      ],
      [
        { id: "r4c1", value: "Pressure Compensating", isHeader: true, align: "left" },
        { id: "r4c2", value: false },
        { id: "r4c3", value: true },
        { id: "r4c4", value: true }
      ]
    ]
  }
};

// Example 4: Multi-section Table with Row Headers
export const multiSectionExample = {
  title: "Dripper Specifications",
  type: "grid",
  content: {
    headers: [
      [
        { id: "h1", value: "Category" },
        { id: "h2", value: "Parameter" },
        { id: "h3", value: "Value" }
      ]
    ],
    rows: [
      [
        { id: "r1c1", value: "Hydraulic", isHeader: true, rowSpan: 3 },
        { id: "r1c2", value: "Flow Rate" },
        { id: "r1c3", value: "2 LPH" }
      ],
      [
        { id: "r2c2", value: "Working Pressure" },
        { id: "r2c3", value: "0.5-4.0 Bar" }
      ],
      [
        { id: "r3c2", value: "Uniformity" },
        { id: "r3c3", value: ">95%" }
      ],
      [
        { id: "r4c1", value: "Physical", isHeader: true, rowSpan: 2 },
        { id: "r4c2", value: "Material" },
        { id: "r4c3", value: "PE (Polyethylene)" }
      ],
      [
        { id: "r5c2", value: "Temperature Range" },
        { id: "r5c3", value: "-10°C to 50°C" }
      ]
    ]
  }
};

// Example 5: Simple List-Style Table
export const listStyleExample = {
  title: "Product Applications",
  type: "grid",
  content: {
    headers: [
      [
        { id: "h1", value: "Application Area" },
        { id: "h2", value: "Suitable For" }
      ]
    ],
    rows: [
      [
        { id: "r1c1", value: "Agriculture", isHeader: true, align: "left" },
        { id: "r1c2", value: "Row crops, vegetables, orchards", align: "left" }
      ],
      [
        { id: "r2c1", value: "Landscaping", isHeader: true, align: "left" },
        { id: "r2c2", value: "Gardens, parks, sports fields", align: "left" }
      ],
      [
        { id: "r3c1", value: "Greenhouse", isHeader: true, align: "left" },
        { id: "r3c2", value: "Potted plants, hydroponics", align: "left" }
      ]
    ]
  }
};

// API Usage Example
export const apiUsageExample = `
// Creating a specification via API
const createSpecification = async (productId, specData) => {
  const response = await fetch('http://localhost:3001/api/specifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      productId,
      title: specData.title,
      type: specData.type,
      content: specData.content,
      displayOrder: '0'
    })
  });
  
  const result = await response.json();
  return result.data;
};

// Fetching specifications for a product
const getSpecifications = async (productId) => {
  const response = await fetch(
    \`http://localhost:3001/api/specifications/product/\${productId}\`,
    { credentials: 'include' }
  );
  
  const result = await response.json();
  return result.data;
};
`;
