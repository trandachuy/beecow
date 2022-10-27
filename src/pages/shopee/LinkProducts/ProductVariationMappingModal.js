import _ from "lodash";
import {PropTypes} from "prop-types";
import React, {useContext, useEffect, useState} from "react";
import Modal from "reactstrap/lib/Modal";
import ModalBody from "reactstrap/lib/ModalBody";
import ModalFooter from "reactstrap/lib/ModalFooter";
import ModalHeader from "reactstrap/lib/ModalHeader";
import GSSelect from "../../../components/shared/form/GSSelect/GSSelect.js";
import GSButton from "../../../components/shared/GSButton/GSButton.js";
import GSTrans from "../../../components/shared/GSTrans/GSTrans.js";
import {ItemService} from "../../../services/ItemService.js";
import {GSToast} from "../../../utils/gs-toast.js";
import {handleMapGSItemToSPItem, mapArrays} from "./SearchProduct/VariationMapping.js";
import {AgencyService} from "../../../services/AgencyService";

export const VariationContext = React.createContext(null);

export default function ProductVariationMappingModal() {
  const {
    processingSpItem,
    setIsVariationMismatched,
    stShopeeProducts,
    setStShopeeProducts,
    mapVariations,
    setMapVariations
  } = useContext(VariationContext);

  const [mappedBcItem, setMappedBcItem] = useState(null);
  const [containDuplicate, setContainDuplicate] = useState(false);

  const cancelMapping = () => {
    setIsVariationMismatched(false);
    setMapVariations({})
  };

  const acceptMapping = () => {
    if (mappedBcItem === null || mappedBcItem.models.length !== processingSpItem.variations.length ||
      containDuplicate === true) {
      return;
    }
    handleMapGSItemToSPItem(mappedBcItem, processingSpItem, true, stShopeeProducts, setStShopeeProducts, ()=>{}, mapVariations);
    setIsVariationMismatched(false);
    setMapVariations({})
  };

  return (
    <div>
      <Modal isOpen={true} size="lg">
        <ModalHeader><GSTrans t="common.txt.confirm.modal.title" /></ModalHeader>
        <ModalBody>
          <p><GSTrans t="page.shopee.linkGsProducts.confirm.modal.description" values={{provider: AgencyService.getDashboardName()}}/></p>
          <MappingTable setMappedBcItem={setMappedBcItem} setContainDuplicate={setContainDuplicate} />
          {containDuplicate &&
            <div className="text-danger mt-3">
              <GSTrans t="shopee.gosell.variation.map.duplicate" />
            </div>
          }
        </ModalBody>
        <ModalFooter>
          <GSButton success outline marginRight onClick={cancelMapping}>
            <GSTrans t="common.btn.cancel" />
          </GSButton>
          <GSButton success onClick={acceptMapping}><GSTrans t="common.btn.ok" /></GSButton>
        </ModalFooter>
      </Modal>
    </div>
  );

}

function MappingTable({ setMappedBcItem, setContainDuplicate }) {
  const { processingSpItem, selectedBcItem, mapVariations, setMapVariations } = useContext(VariationContext);
  const [variationOptions, setVariationOptions] = useState({});
  const [bcVariations, setBcVariations] = useState(null);
  const [defaultVariationOptions, setDefaultVariationOptions] = useState(null);

  const spVariations = processingSpItem.variations;

  if (!spVariations && !bcVariations) {
    return null;
  }

  useEffect(() => {
    if (selectedBcItem.id) {
      ItemService.getGsVariationByBcItemId(selectedBcItem.id)
        .then(models => setBcVariations(models))
        .catch(() => GSToast.commonError());
    }
  }, [selectedBcItem]);

  useEffect(() => {
    if (bcVariations) {
      let initOptions = {};
      const spVariations = processingSpItem.variations;
      for (let i = 0; i < spVariations.length; i++) {
        const id = spVariations[i].id;
        initOptions = {
          ...initOptions,
          [id]: bcVariations.map(bcVariation => ({
            value: bcVariation.id,
            label: bcVariation.name,
            bcVariation
          }))
        };
      }
      setVariationOptions(initOptions);
      setDefaultVariationOptions(initOptions);
    }
  }, [bcVariations]);

  useEffect(() => {
    if (processingSpItem && selectedBcItem && Object.keys(mapVariations).length > 0) {
      const mappedModels = mapArrays(processingSpItem.variations, selectedBcItem.models, mapVariations);
      const mappedBcItem = _.clone(selectedBcItem);
      mappedBcItem.models = mappedModels; // all items are undefined!!!
      setMappedBcItem(mappedBcItem);
    }
  }, [mapVariations, processingSpItem, selectedBcItem]);

  useEffect(() => {
    if (Object.keys(mapVariations).length > 0) {
      const newVariationOptions = _.clone(variationOptions);
      const optionEntries = Object.entries(newVariationOptions);
      const mapVariationValues = Object.values(mapVariations);

      optionEntries.forEach(optionEntry => {
        const optionEntryId = optionEntry[0];
        const defaultOptions = defaultVariationOptions[optionEntryId];
        const unselectedOptions = defaultOptions.filter(
          option => mapVariationValues.find(val => val.id === option.value) === undefined
        );
        newVariationOptions[optionEntryId] = unselectedOptions;
      });
      setVariationOptions(newVariationOptions);
    }
  }, [mapVariations]);

  useEffect(() => {
    if (Object.keys(mapVariations).length > 0) {
      const allOptionsSelected = Object.keys(mapVariations).length === Object.keys(defaultVariationOptions).length;
      if (allOptionsSelected) {
        setVariationOptions(defaultVariationOptions);
      }
    }
  }, [mapVariations]);

  useEffect(() => {
    if (Object.keys(mapVariations).length > 0) {
      const mapVariationValues = Object.values(mapVariations);
      setContainDuplicate(containsDuplicateValues(mapVariationValues));
    }
  }, [mapVariations]);

  const containsDuplicateValues = (values = []) => {
    const uniqueVals = new Set();
    values.forEach(val => uniqueVals.add(val.id));
    return uniqueVals.size !== values.length;
  };

  const selectMappingVariation = (spVarId, option) => {
    setMapVariations({ ...mapVariations, [spVarId]: option.bcVariation });
  };

  return (
    <div className="bg-light align-items-center">
      <table className="w-100">
        <thead>
          <tr>
            <th className="p-3 font-weight-bold text-uppercase">
              <GSTrans t="modal.content.table.header.shopeeProduct" />
            </th>
            <th className="p-3 font-weight-bold text-uppercase">
              <GSTrans t="modal.content.table.header.gosellProduct" values={{provider: AgencyService.getDashboardName()}}/>
            </th>
          </tr>
        </thead>

        <tbody>
          {spVariations.map(spVariation => (
            <tr key={spVariation.id} className="border-top">
              <td className="p-2">{spVariation.name}</td>
              <td className="py-2 px-5">
                <GSSelect
                  options={variationOptions[spVariation.id]}
                  onChange={(option) => selectMappingVariation(spVariation.id, option)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

MappingTable.propTypes = {
  setMappedBcItem: PropTypes.func,
};
