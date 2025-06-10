// import TopHeader from './components/TopHeader'
import ProposalFilters from "./ProposalFilters.jsx";
import ProposalTable from "./ProposalTable.jsx";

function App() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="flex-1">
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-red-600 mb-1">Proposal</h1>
            <p className="text-gray-500">Manage all your proposal</p>
          </div>

          {/* Search and Controls */}
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customers/Proposal ID ..."
                  className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50">
                <span>📅</span>
              </button>

              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                <option>Status</option>
                <option>Hot</option>
                <option>Cold</option>
                <option>Warm</option>
                <option>Frozen</option>
                <option>Completed</option>
              </select>

              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2">
                <span>+</span>
                <span>Add New</span>
              </button>
            </div>
          </div>

          {/* Components with box shadow */}
          <div className="space-y-6 bg-white rounded-xl shadow-lg p-6">
            <div className=" ">
              <ProposalFilters />
            </div>
            <div className="p-6">
              <ProposalTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
