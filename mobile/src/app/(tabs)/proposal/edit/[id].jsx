import { useLocalSearchParams } from 'expo-router';
import AddProposal from '../AddProposal';

const EditProposal = () => {
  const { id } = useLocalSearchParams();

  return <AddProposal isEdit={true} proposalId={id} />;
};

export default EditProposal;