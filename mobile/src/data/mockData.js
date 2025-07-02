export const customers = [
  {
    id: 1,
    name: 'Vinoth R',
    phone: '+91 94536 345357',
    email: 'vinoth@gmail.com',
    address: '123/ss colony, Thirunagar, Madurai-625018',
    services: ['Home Cinema', 'Home Automation'],
    amountSpend: '₹30,00,000',
  },
  {
    id: 2,
    name: 'Vaisu K',
    phone: '+91 85675 56482',
    email: 'vaisu.k@gmail.com',
    address: '23/98,selva 1st, lyerbunglow, Madurai-625015',
    services: ['Security System'],
    amountSpend: '₹26,00,000',
  },
  {
    id: 3,
    name: 'Aravind U',
    phone: '+91 98765 43210',
    email: 'aravind.u@gmail.com',
    address: '78/2 KK Nagar, Madurai-625012',
    services: ['Home Automation', 'Security System'],
    amountSpend: '₹22,00,000',
  },
  {
    id: 4,
    name: 'Dinesh A',
    phone: '+91 87654 32109',
    email: 'dinesh.a@gmail.com',
    address: '12/A Bypass Road, Madurai-625016',
    services: ['Outdoor Audio', 'Home Cinema'],
    amountSpend: '₹18,00,000',
  },
  {
    id: 5,
    name: 'Magesh J',
    phone: '+91 76543 21098',
    email: 'magesh.j@gmail.com',
    address: '34/C SS Colony, Madurai-625010',
    services: ['Home Cinema', 'Security System'],
    amountSpend: '₹35,00,000',
  },
  {
    id: 6,
    name: 'Varadharajan M',
    phone: '+91 65432 10987',
    email: 'varadharajan.m@gmail.com',
    address: '23/5B Anna Nagar, Madurai-625020',
    services: ['Security System', 'Home Automation'],
    amountSpend: '₹28,00,000',
  }
];

export const projectData = [
  {
    id: 1,
    customerName: 'Vinoth R',
    address: '123/ss colony, Thirunagar, Madurai-625018',
    service: 'Home Cinema',
    amount: '₹30,00,000',
    date: '26/05/2025',
    status: 'InProgress',
    progress: '1/3',
  },
  {
    id: 2,
    customerName: 'Vaisu K',
    address: '23/98,selva 1st, lyerbunglow, Madurai-625015',
    service: 'Security System',
    amount: '₹26,00,000',
    date: '18/05/2025',
    status: 'InProgress',
    progress: '2/5',
  },
  {
    id: 3,
    customerName: 'Aravind U',
    address: '78/2 KK Nagar, Madurai-625012',
    service: 'Home Automation',
    amount: '₹22,00,000',
    date: '28/05/2025',
    status: 'Pending',
    progress: '1/2',
  },
  {
    id: 4,
    customerName: 'Dinesh A',
    address: '12/A Bypass Road, Madurai-625016',
    service: 'Outdoor Audio',
    amount: '₹18,00,000',
    date: '10/06/2025',
    status: 'Completed',
    progress: '2/2',
  },
  {
    id: 5,
    customerName: 'Magesh J',
    address: '34/C SS Colony, Madurai-625010',
    service: 'Home Cinema',
    amount: '₹35,00,000',
    date: '05/06/2025',
    status: 'InProgress',
    progress: '2/3',
  },
  {
    id: 6,
    customerName: 'Varadharajan M',
    address: '23/5B Anna Nagar, Madurai-625020',
    service: 'Security System',
    amount: '₹28,00,000',
    date: '12/06/2025',
    status: 'Pending',
    progress: '1/4',
  }
];

export const proposalData = [
  {
    id: 1,
    name: "John Smith",
    date: "2024-01-15",
    phone: "+91 98765 43210",
    email: "john.smith@example.com",
    address: "123 Main Street, Chennai, Tamil Nadu 600001",
    service: "Home Cinema",
    description: "Complete home theater setup with 4K projector and surround sound",
    size: "400 Sqft",
    amount: "₹3,00,000",
    status: "Hot",
    comment: "Client interested in premium audio setup with Dolby Atmos",
    history: [
      {
        date: "2024-01-15",
        amount: "₹2,80,000",
        type: "Initial Quote"
      },
      {
        date: "2024-01-16",
        amount: "₹3,00,000",
        type: "Revised Quote"
      }
    ]
  },
  {
    id: 2,
    name: "Priya Patel",
    date: "2024-01-16",
    phone: "+91 87654 32109",
    email: "priya.patel@example.com",
    address: "456 Park Avenue, Bangalore, Karnataka 560001",
    service: "Home Automation",
    description: "Smart home setup with lighting, climate, and security control",
    size: "1200 Sqft",
    amount: "₹5,50,000",
    status: "Warm",
    comment: "Interested in voice control and mobile app integration",
    history: [
      {
        date: "2024-01-16",
        amount: "₹5,00,000",
        type: "Initial Quote"
      },
      {
        date: "2024-01-17",
        amount: "₹5,50,000",
        type: "Updated Quote"
      }
    ]
  },
  {
    id: 3,
    name: "Rajesh Kumar",
    date: "2024-01-17",
    phone: "+91 76543 21098",
    email: "rajesh.kumar@example.com",
    address: "789 Tech Park, Hyderabad, Telangana 500001",
    service: "Security System",
    description: "CCTV installation with smart doorbell and access control",
    size: "800 Sqft",
    amount: "₹2,50,000",
    status: "Cold",
    comment: "Needs detailed security camera placement plan",
    history: [
      {
        date: "2024-01-17",
        amount: "₹2,50,000",
        type: "Initial Quote"
      }
    ]
  },
  {
    id: 4,
    name: "Sarah Johnson",
    date: "2024-01-18",
    phone: "+91 65432 10987",
    email: "sarah.j@example.com",
    address: "321 Beach Road, Mumbai, Maharashtra 400001",
    service: "Outdoor Audio",
    description: "Weatherproof speaker system for garden and pool area",
    size: "600 Sqft",
    amount: "₹1,80,000",
    status: "Confirm",
    comment: "Requires waterproof equipment for coastal environment",
    history: [
      {
        date: "2024-01-18",
        amount: "₹1,50,000",
        type: "Initial Quote"
      },
      {
        date: "2024-01-19",
        amount: "₹1,80,000",
        type: "Final Quote"
      }
    ]
  },
  {
    id: 5,
    name: "Amit Shah",
    date: "2024-01-19",
    phone: "+91 54321 09876",
    email: "amit.shah@example.com",
    address: "987 Hill View, Pune, Maharashtra 411001",
    service: "Home Cinema",
    description: "Multi-room audio visual system with central control",
    size: "1500 Sqft",
    amount: "₹7,20,000",
    status: "Scrap",
    comment: "Budget constraints, may revisit in next quarter",
    history: [
      {
        date: "2024-01-19",
        amount: "₹7,20,000",
        type: "Initial Quote"
      }
    ]
  }
];

export const employees = [
  {
    id: "EMP-001",
    name: "Arun R",
    role: "Installation Specialist",
    department: "Installation",
    phone: "+91 87541 486311",
    email: "arun@gmail.com",
    image: require("../../assets/icons/Frame01.png"),
    status: "Active",
  },
  {
    id: "EMP-006",
    name: "Bala D",
    role: "Lead Technician",
    department: "Installation",
    phone: "+91 78541 64563",
    email: "bala@gmail.com",
    image: require("../../assets/icons/Frame02.png"),
    status: "Active",
  },
  {
    id: "EMP-003",
    name: "Anbarasan V",
    role: "Service Technician",
    department: "Service",
    phone: "+91 96541 486322",
    email: "anbarasan@gmail.com",
    image: require("../../assets/icons/Frame03.png"),
    status: "Inactive",
  },
  {
    id: "EMP-004",
    name: "Rajesh K",
    role: "Service Manager",
    department: "Service",
    phone: "+91 89541 456789",
    email: "rajesh@gmail.com",
    image: require("../../assets/icons/Frame02.png"),
    status: "Active",
  },
  {
    id: "EMP-005",
    name: "Mohan S",
    role: "Installation Expert",
    department: "Installation",
    phone: "+91 94321 987654",
    email: "mohan@gmail.com",
    image: require("../../assets/icons/Frame01.png"),
    status: "Inactive",
  },
  {
    id: "EMP-007",
    name: "Kumar P",
    role: "Technical Support",
    department: "Service",
    phone: "+91 73456 789012",
    email: "kumar@gmail.com",
    image: require("../../assets/icons/Frame03.png"),
    status: "Active",
  }
];

export default { customers, projectData, proposalData, employees };