// Shared worker data structure
export const workerCategories = [
  {
    id: 'heating',
    name: 'Heating & Boiler',
    workers: [
      {
        id: 'mj',
        initials: 'MJ',
        name: 'Mike Johnson',
        specialty: 'Boiler Specialist',
        rating: 4.2,
        phone: '+44 7700 654321',
        description: 'Expert Boiler Repairs',
        favorite: false,
        category: 'heating'
      }
    ]
  },
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
    id: 'kitchen',
    name: 'Kitchen',
    workers: []
  },
  {
    id: 'damp',
    name: 'Damp & Mould',
    workers: []
  },
  {
    id: 'general',
    name: 'General',
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