// Shared worker data structure matching tenant issue categories
export const workerCategories = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    workers: [
      {
        id: 'sd',
        initials: 'SD',
        name: 'Sarah Davis',
        specialty: 'Senior Plumber',
        rating: 4.8,
        phone: '+44 7700 123456',
        description: 'Professional Plumbing Services',
        favorite: true,
        category: 'plumbing'
      }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical',
    workers: []
  },
  {
    id: 'hvac',
    name: 'HVAC',
    workers: [
      {
        id: 'mj',
        initials: 'MJ',
        name: 'Mike Johnson',
        specialty: 'HVAC Specialist',
        rating: 4.2,
        phone: '+44 7700 654321',
        description: 'Expert Heating & Cooling Repairs',
        favorite: false,
        category: 'hvac'
      }
    ]
  },
  {
    id: 'appliances',
    name: 'Appliances',
    workers: []
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    workers: []
  },
  {
    id: 'security',
    name: 'Locks/Security',
    workers: []
  },
  {
    id: 'painting',
    name: 'Painting/Walls',
    workers: []
  },
  {
    id: 'flooring',
    name: 'Flooring',
    workers: []
  },
  {
    id: 'windows-doors',
    name: 'Windows/Doors',
    workers: []
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    workers: []
  },
  {
    id: 'other',
    name: 'Other',
    workers: []
  }
];

// Helper functions to work with worker data
export const getAllWorkers = () => {
  return workerCategories.reduce((acc, category) => {
    return [...acc, ...category.workers];
  }, [] as any[]);
};

export const getFavoriteWorkers = () => {
  return getAllWorkers().filter(worker => worker.favorite);
};

export const getWorkersByCategory = (categoryId: string) => {
  const category = workerCategories.find(cat => cat.id === categoryId);
  return category ? category.workers : [];
};

export const getWorkerById = (workerId: string) => {
  return getAllWorkers().find(worker => worker.id === workerId);
};