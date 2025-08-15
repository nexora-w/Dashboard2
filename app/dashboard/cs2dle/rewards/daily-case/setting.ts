// API utility functions for CS2DLE daily case operations

export interface PreCase {
  _id: string;
  skinId: string;
  name: string;
  description: string;
  image: string;
  weapon: {
    id: string;
    weapon_id: number;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  pattern: {
    id: string;
    name: string;
  };
  min_float: number | null;
  max_float: number | null;
  rarity: {
    id: string;
    name: string;
    color: string;
  };
  stattrak: boolean;
  souvenir: boolean;
  paint_index: string | null;
  probability: number;
  price: number;
  status: string;
  createdBy: string;
  lastModifiedBy: string;
  createdAt: string;
  isManual: boolean;
  updatedAt?: string;
}

export interface EditPreCaseRequest {
  _id: string;
  skinId?: string;
  name?: string;
  description?: string;
  image?: string;
  weapon?: {
    id: string;
    weapon_id: number;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  pattern?: {
    id: string;
    name: string;
  };
  min_float?: number | null;
  max_float?: number | null;
  rarity?: {
    id: string;
    name: string;
    color: string;
  };
  stattrak?: boolean;
  souvenir?: boolean;
  paint_index?: string | null;
  probability?: number;
  price?: number;
  status?: 'active' | 'inactive';
}

export interface ToggleStatusRequest {
  _id: string;
  status: 'active' | 'inactive';
}

export interface CreatePreCaseRequest {
  skinId?: string;
  name: string;
  description?: string;
  image: string;
  weapon: {
    id?: string;
    weapon_id?: number;
    name: string;
  };
  category: {
    id?: string;
    name: string;
  };
  pattern: {
    id?: string;
    name: string;
  };
  min_float?: number | null;
  max_float?: number | null;
  rarity: {
    id?: string;
    name: string;
    color?: string;
  };
  paint_index?: string | null;
  probability?: number;
  price?: number;
  status?: 'active' | 'inactive';
  stattrak?: boolean;
  souvenir?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  precase?: PreCase;
  preCase?: PreCase[];
  error?: string;
}

// Edit a precase item
export async function editPreCase(data: EditPreCaseRequest): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/cs2dle/rewards/daily-case/edit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to edit precase');
    }

    return result;
  } catch (error) {
    console.error('Error editing precase:', error);
    throw error;
  }
}

// Toggle status of a precase item
export async function togglePreCaseStatus(data: ToggleStatusRequest): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/cs2dle/rewards/daily-case/toggle-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to toggle precase status');
    }

    return result;
  } catch (error) {
    console.error('Error toggling precase status:', error);
    throw error;
  }
}

// Get all precase items
export async function getAllPreCases(): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/cs2dle/rewards/daily-case/all');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch precases');
    }

    return result;
  } catch (error) {
    console.error('Error fetching precases:', error);
    throw error;
  }
}

// Create a new precase item
export async function createPreCase(data: CreatePreCaseRequest): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/cs2dle/rewards/daily-case/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create precase');
    }

    return result;
  } catch (error) {
    console.error('Error creating precase:', error);
    throw error;
  }
}
