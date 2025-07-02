const DashboardHeader = ({ title, description }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-red-600">{title}</h1>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default DashboardHeader;
