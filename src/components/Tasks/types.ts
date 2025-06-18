export interface Task {
  title: string;
  assignee: string;
  startDate: Date;
  endDate: Date;
  status: string;
  note: string;
  beforeImages: string[];
  afterImages: string[];
  attachment: {
    name: string;
  } | null;
}

export interface EditTaskFormProps {
  editingTask: Task;
  setEditingTask: (task: Task) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  activeDateField: 'start' | 'end' | null;
  setActiveDateField: (field: 'start' | 'end' | null) => void;
  showStatusDropdown: boolean;
  setShowStatusDropdown: (show: boolean) => void;
  statusOptions: Array<{
    value: string;
    color: string;
    bg: string;
  }>;
  pickImages: (type: 'beforeImages' | 'afterImages') => Promise<void>;
  removeImage: (type: 'beforeImages' | 'afterImages', index: number) => void;
  setShowEditForm: (show: boolean) => void;
}