/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 03/07/2019
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import React from "react";
import PropTypes from "prop-types";
import Select from "react-select"; // docs: https://react-select.com/home
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const GSSelect = (props) => {
    const { noOptionsMessage, maxSelect, components, type, name, ...other } =
        props;

    return (
        <Select
            {...other}
            // onChange={onPreChange}
            //     value={stValue}
            styles={{
                control: (style) => {
                    return {
                        ...style,
                        cursor: "pointer",
                    };
                },
                menu: (style) => ({
                    ...style,
                    zIndex: 4,
                }),
                indicatorSeparator: (style) => ({
                    hidden: false,
                }),
                valueContainer: (styles) => {
                    return {
                        ...styles,
                        padding: "0 10px",
                    };
                },
                multiValue: (styles) => {
                    return {
                        ...styles,
                        backgroundColor: "#FBFBFD",
                        border: "1px solid #EAEDF3",
                        borderRadius: "4px",
                        padding: "2px 0px",
                        margin: "1px 2px 1px 0px",
                    };
                },
                multiValueLabel: props.styleMultiValueLabel
                    ? props.styleMultiValueLabel
                    : (styles) => ({
                          ...styles,
                          color: "black",
                      }),
                multiValueRemove: props.styleMultiValueRemove
                    ? props.styleMultiValueRemove
                    : (styles) => {
                          return {
                              ...styles,
                              color: "#9EA0A5",
                              ":hover": {
                                  color: "red",
                              },
                          };
                      },
            }}
            theme={(theme) => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    primary25: "#F6F9FD",
                    primary: "rgba(0, 123, 255, 0.25)",
                },
            })}
            components={{
                DropdownIndicator: () => (
                    <div
                        style={{
                            padding: "0 10px",
                            color: "#9EA0A5",
                        }}
                    >
                        <FontAwesomeIcon icon={"sort"} />
                    </div>
                ),
                NoOptionsMessage: () => (
                    <div
                        style={{
                            textAlign: "center",
                            color: "#939393",
                        }}
                    >
                        {props.noOptionsMessage}
                    </div>
                ),
            }}
        />
    );
};

GSSelect.propTypes = {
    noOptionsMessage: PropTypes.string,
    styleMultiValueRemove: PropTypes.func,
    styleMultiValueLabel: PropTypes.func,
    components: PropTypes.object,
    maxSelect: PropTypes.number,
};

export default GSSelect;
