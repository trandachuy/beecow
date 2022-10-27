import React, { useContext, useEffect, useState } from "react";
import Spinner from "reactstrap/lib/Spinner";
import { UikCheckbox, UikRadio } from "../../../@uik";
import storeService from "../../../services/StoreService";
import { GSToast } from "../../../utils/gs-toast";
import "./BranchesSelector.sass";

export const BranchContext = React.createContext();
export const BRANCH_SELECT_MODE_IMPORT = "import";
export const BRANCH_SELECT_MODE_EXPORT = "export";

const BranchesSelector = ({ mode }) => {

  const [branches, setBranches] = useState([]);
  const [defaultBranchId, setDefaultBranchId] = useState(null);

  const [selectedBranches, setSelectedBranches] = useContext(BranchContext);

  useEffect(_ => {
    storeService.getActiveStoreBranches()
      .then(result => {
        const fetchedBranches = result.map(branch => ({ id: branch.id, label: `${branch.name} - ${branch.address}` }));
        setBranches(fetchedBranches);
      })
      .catch(_ => {
        GSToast.error("common.message.server.response", true);
      });
  }, []);

  useEffect(_ => {
    storeService.getDefaultBranch()
      .then(defaultBranch => {
        setDefaultBranchId(defaultBranch.id);
      })
      .catch(_ => {
        GSToast.error("common.message.server.response", true);
      });
  }, []);

  useEffect(_ => {
    if (branches.find(branch => branch.id === defaultBranchId)) {
      if (mode === BRANCH_SELECT_MODE_IMPORT) {
        setSelectedBranches([...selectedBranches, defaultBranchId]);
      }
      else {
        setSelectedBranches([defaultBranchId]);
      }
    }
  }, [defaultBranchId, branches]); // only run this effect hook when defaultBranchId and branches have values

  const onCheck = (branchId, checked) => {
    if (checked) {
      setSelectedBranches([...selectedBranches, branchId]);
    }
    else {
      setSelectedBranches(selectedBranches.filter(selectedBranchId => (selectedBranchId !== branchId)));
    }
  };

  const onRadioSelect = (branchId) => {
    setSelectedBranches([branchId]);
  };

  const isImport = mode === BRANCH_SELECT_MODE_IMPORT;
  return (
    <section className="gs-branches-selector">
      {branches.length > 0 ?
        branches.map(branch => {
          return (
            isImport
              ?
              <UikCheckbox
                checked={selectedBranches.find(selectedBranch => branch.id === selectedBranch)}
                className="margin"
                key={`br_slt_${branch.id}`}
                label={<span className="gs-branches-selector__text-limited font-style">{branch.label}</span>}
                onChange={e => { onCheck(branch.id, e.target.checked); }} />
              : (selectedBranches && <UikRadio
                name="gs-branch-radio-selector"
                checked={selectedBranches.find(selectedBranch => branch.id === selectedBranch)}
                className="margin"
                key={`br_slt_${branch.id}`}
                label={<span className="gs-branches-selector__text-limited font-style">{branch.label}</span>}
                onChange={_ => { onRadioSelect(branch.id); }} />)
          );
        })
        : <Spinner className="m-auto" color="success" />
      }
    </section>
  );
};

export default BranchesSelector;
