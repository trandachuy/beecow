/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/

import styled from "styled-components";
import {xs} from "../../../../../utils/styled-breakpoints";

export const LocationListWrapper = styled.div`
  margin-bottom: 1rem;
  margin-top: 1rem;
  border: 1px solid #DDE0E9;
  position: relative;
    
    .uik-checkbox__wrapper {
      margin-bottom: 0 !important;
    }
`

export const LocationListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: #EFEFEF;
  padding: .5rem;
  border-bottom: 1px solid #DDE0E9;
`

export const LocationListBody = styled.div`
  display: flex;
  min-width: 600px;
  text-align: left;
  ${xs} {
    min-width: unset;
  }
`

export const CountryListWrapper = styled.div.attrs(props => ({
    hasCity: props.hasCity
}))`
  height: 50vh;
  overflow-y: auto;
  overflow-x: auto;
  flex-basis: ${props => props.hasCity? '50%':'100%'};
  transition: .3s;
  border-right: 1px solid #DDE0E9;
`

export const CityListWrapper = styled.div.attrs(props => ({
    hasCity: props.hasCity
}))`
  height: 50vh;
  overflow-y: auto;
  overflow-x: auto;
  flex-basis: ${props => props.hasCity? '50%':'0%'};
  transition: .3s;
`

export const CountryRow = styled.div.attrs(props => ({
    readOnly: props.readOnly
}))`
  display: flex;
  justify-content: flex-start;
  padding: 0 .5rem;
  margin: .5rem 0;
  align-items: center;
  filter: ${props => props.readOnly? 'grayscale(1)':'none'};
  
  span {
    user-select: none;
  }

  span {
    opacity: ${props => props.readOnly? '.5':'1'};;
  }
`

export const CityRow = styled.div.attrs(props => ({
    readOnly: props.readOnly
}))`
  display: flex;
  justify-content: flex-start;
  padding: 0 .5rem;
  margin: .5rem 0;
  align-items: center;
  filter: ${props => props.readOnly? 'grayscale(1)':'none'};

  span {
    user-select: none;
  }
  
  span {
    opacity: ${props => props.readOnly? '.5':'1'};;
  }
`

export const CountryRowName = styled.span.attrs(props => ({
    active: props.active
}))`
  cursor: pointer;
  :hover {
    .country-name {
      color: #0074F9;
    }
  }
  display: flex;
  justify-content: space-between;
  width: 100%;
  
  .country-name {
    color: ${props => props.active? '#0074F9':'black'};
    font-weight: ${props => props.active? '500':'normal'};
  }
  
`

export const EmptySearch = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  width: 100%;
  height: 100%;
  justify-content: center;
`