import logo from './logo.svg';
import './App.css';
import FilterTableComponent from './components/filter.table';
import AnotherTable from './components/newtable';
import BootstrapTableNew from './components/BootstrapTableNew';

function App() {
  return (
    <div className="App">
      <div className="container">
        {/* <FilterTableComponent /> */}
        {/* <AnotherTable /> */}
        <BootstrapTableNew />
      </div>
    </div>
  );
}

export default App;
