import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import i18next from "i18next";
import _ from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { UikCheckbox } from "../../../../@uik";
import GSSelect from "../../../../components/shared/form/GSSelect/GSSelect";
import GSWidget from "../../../../components/shared/form/GSWidget/GSWidget";
import GSWidgetContent from "../../../../components/shared/form/GSWidget/GSWidgetContent";
import GSTrans from "../../../../components/shared/GSTrans/GSTrans";
import { ItemService } from "../../../../services/ItemService";
import { ThemeMakingContext } from "../context/ThemeMakingContext";
import ColorPicker from "./shared/ColorPicker";
import "./SubElementFlashSaleDates.sass";

const productPerRowOptions = [
  { value: 3, label: 3 },
  { value: 4, label: 4 },
  { value: 5, label: 5 },
  { value: 6, label: 6 }
];

const SubElementFlashSaleDates = (props) => {
  const { state, dispatch } = useContext(ThemeMakingContext.context);

  const { itemsPerSlide, dates, soldBarColor, isDisplaySold, path } = props;

  const [stItemsPerSlide, setStItemsPerSlide] = useState(itemsPerSlide);
  const [stDates, setStDates] = useState(dates);
  const [stSoldBarColor, setStSoldBarColor] = useState(soldBarColor);
  const [stIsDisplaySold, setStIsDisplaySold] = useState(isDisplaySold);
  const [flashSaleDates, setFlashSaleDates] = useState([]);

  useEffect(() => {
    fetchFlashSaleDates();
  }, []);

  useEffect(() => {
    if (state.controller.isTranslate) {
      return
    }

    dispatch(ThemeMakingContext.actions.editSubElementReturn({
      path, changes: {
        itemsPerSlide: stItemsPerSlide,
        dates: stDates,
        soldBarColor: stSoldBarColor,
        isDisplaySold: stIsDisplaySold
      }
    }));
  }, [stItemsPerSlide, stDates, stSoldBarColor, stIsDisplaySold]);

  const fetchFlashSaleDates = () => {
    ItemService.getFlashSaleDate().then(flashSaleDates => {
      setFlashSaleDates(_.map(flashSaleDates, flashSaleDate => ({
        value: flashSaleDate.startOf("day").format("YYYY-MM-DDTHH:mm:ssZ"),
        label: flashSaleDate.format("DD/MM/YYYY")
      })));
    });
  }

  const onChangeItemsPerSlide = (newVal) => {
    setStItemsPerSlide(newVal.label);
  }

  const onChangeFlashSaleDates = (values) => {
    const selectedDates = flashSaleDates.reduce((store, current) => {
      if (values.find(item => item.label === current.label)) {
        store.push(current);
      }
      return store;
    }, []);
    setStDates(selectedDates);
  }

  const onClickCheckDisplaySold = (checked) => {
    setStIsDisplaySold(checked);
  }

  let timeout;
  const onChangeColor = (colorValue) => {
    clearTimeout(timeout); // debounce technique
    timeout = setTimeout(() => {
      setStSoldBarColor(colorValue);
    }, 500);
  }

  return (
    <div className={state.controller.isTranslate ? 'disabled' : ''}>
      <FlashSaleDateSelector
        dateOptions={flashSaleDates}
        isDisplaySold={stIsDisplaySold}
        value={stDates}
        updateFlashSaleDates={onChangeFlashSaleDates}
        onClickCheckDisplaySold={onClickCheckDisplaySold}
      />
      <div className="w-100 pl-3 align-items-center justify-content-start">
        <FlashSaleColorPicker onChangeColor={onChangeColor}
          soldBarColor={stSoldBarColor}
        />
      </div>
      <FlashSaleItemsPerSlideSelector
        onChangeItemsPerSlide={onChangeItemsPerSlide}
        itemsPerSlide={stItemsPerSlide} />
    </div>
  );
}

const FlashSaleColorPicker = ({ onChangeColor, soldBarColor }) => (
  <div className="flash-sale-color-picker w-75">
    <span className="flash-sale-color-picker-title">
      <GSTrans t="component.themeEditor.subElement.flash_sale.colorSoldBar" />
    </span>
    <div className="w-50">
      <ColorPicker
        name="flash_sale_sold_bar_color"
        className="w-50"
        text={i18next.t("component.theme.color.background.name")}
        chooseColorCallback={value => onChangeColor(value)}
        value={soldBarColor}
      />
    </div>

  </div>
);

const FlashSaleDateSelector = ({ dateOptions, updateFlashSaleDates, onClickCheckDisplaySold, isDisplaySold, value }) => (
  <GSWidget className="m-0">
    <GSWidgetContent className="flash-sale-selector-bg">
      <GSSelect
        isMulti
        value={value}
        options={dateOptions}
        noOptionsMessage={i18next.t("page.flashSale.create.time.selectDate")}
        placeholder={i18next.t("page.flashSale.create.time.selectDate")}
        onChange={updateFlashSaleDates}
      />
      <UikCheckbox
        className="flash-sale-component-editor-checkbox mt-3 font-weight-bold"
        label={i18next.t("page.storeFront.flashSale.displaySold")}
        onChange={e => onClickCheckDisplaySold(e.target.checked)}
        checked={isDisplaySold}
      />
    </GSWidgetContent>
  </GSWidget>
);


const FlashSaleItemsPerSlideSelector = ({ onChangeItemsPerSlide, itemsPerSlide }) => (
  <>
    <span className="flash-sale-items-per-slide-selector d-block w-100 mt-3">
      <span className="sub-element-editor-wrapper__icon">
        <FontAwesomeIcon icon="box" />
      </span>
      <span><GSTrans t="component.themeEditor.subElement.flash_sale.productPerRow" /></span>
    </span>
    <GSWidget className="m-0">
      <GSWidgetContent className="flash-sale-selector-bg">
        <GSSelect
          options={productPerRowOptions}
          value={productPerRowOptions.find(option => option.value === itemsPerSlide)}
          onChange={newVal => onChangeItemsPerSlide(newVal)}
          menuPlacement="top"
          isSearchable={false}
        />
      </GSWidgetContent>
    </GSWidget>
  </>
);


export default SubElementFlashSaleDates;
