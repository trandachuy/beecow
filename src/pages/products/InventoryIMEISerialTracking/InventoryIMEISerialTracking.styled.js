/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 25/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/
import styled from "styled-components";
import {xs} from "../../../utils/styled-breakpoints";

export const FilterWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
  
    .inventory-tracking-branch-selector .gs-dropdown-multiple-select__drop-header {
      width: 250px;
    }

    .inventory-tracking-branch-selector .uik-menuDrop__list {
      width: 350px;
    }
  
    .inventory-tracking-status-selector {
        margin-left: .5rem;
        width: 200px;
    }
  
  ${xs} {
    margin-top: 1rem;
    align-self: stretch;
    
    .inventory-tracking-branch-selector .gs-dropdown-multiple-select__drop-header {
      width: 100% !important;
    }
    .inventory-tracking-branch-selector .uik-menuDrop__list {
      width: 80vw !important;
    }

    .inventory-tracking-status-selector {
      margin-left: .5rem;
      width: 100% !important;
    }
  }

`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  ${xs} {
    flex-direction: column;
  }
`

export const TitleWrapper = styled.div`

`

export const TrackingList = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`

export const TableWrapper = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`