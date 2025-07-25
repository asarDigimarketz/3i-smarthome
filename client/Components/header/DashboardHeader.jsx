const DashboardHeader = ({ title, description }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary">{title}</h1>
      <p className="text-[#94A3B8]">{description}</p>
    </div>
  );
};

export default DashboardHeader;
