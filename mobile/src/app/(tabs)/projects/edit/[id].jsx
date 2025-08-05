import { useLocalSearchParams } from 'expo-router';
import AddProject from '../AddProjects';

const EditProject = () => {
  const { id } = useLocalSearchParams();

  return <AddProject isEdit={true} projectId={id} />;
};

export default EditProject; 