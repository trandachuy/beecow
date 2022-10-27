import styled from "styled-components";
import {xs} from "../../../../../utils/styled-breakpoints";

/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 16/11/2021
 * Author: Quy Luong <quy.luong@mediastep.com>
 *******************************************************************************/




export const LocationWrapper = styled.div`
    border-radius: 3px;
    border: 1px solid #EAEDF3;
    margin-bottom: 1.5rem;
`

export const Header = styled.div`
  background-color: #FAFAFA;
  padding: .5rem 1rem;
  display: flex;
  align-items: flex-start;
  
  ${xs} {
    flex-direction: column;
    align-items: flex-start;
  }
  
`

export const Body = styled.div`

`

export const CountryNameHeading = styled.h3.attrs(props => ({
    isCollapsed: props.isCollapsed
}))`
  margin-bottom: 0;
  max-width: 30rem;
  overflow-y: ${props => props.isCollapsed? 'hidden':'unset'};
  overflow-x: hidden;
  max-height: ${props => props.isCollapsed? '2rem':'fit-content'};;
  line-height: 2rem;
  position: relative;
  padding-right: 1rem;
  transition: .3s max-height;
  
  .fa-caret-down {
    position: absolute;
    top: 0;
    right: 2px;
    padding: 2px;
    box-sizing: content-box;
    transform: rotateX(${props => props.isCollapsed? 0:'180deg'});
    user-select: none;
  }
  
  ${xs} {
    width: 100%;
  }
`

export const ActionsHeading = styled.div`
  display: flex;
  white-space: nowrap;
  margin-left: auto;
  margin-top: .2rem;
  span {
    padding: 0 .5rem;
  }
  
  ${xs} {
    margin-top: .5rem;
    margin-left: unset;

    .gs-fake-link:first-child {
      padding-left: unset;
    }
  }
`

export const RuleTable = styled.table`
  width: 100%;

  th {
    padding: .5rem;
  }
  
  td {
    padding: 1rem .5rem;
    
    :first-child {
      padding-left: 1rem;
    }
    
    :last-child {
      padding-right: 1rem;
    }
  }
  
  thead {
    background-color: #F7F7F7;
    text-transform: uppercase;
    font-size: 12px;
    border: 1px solid #EAEDF3;
    th {
      font-weight: 500;
    }
  }
  
  thead tr {
    th {
      :first-child {
        width: 22rem;
        padding-left: 1rem;
      }

      :nth-child(2) {
        width: 15rem;
      }

      :last-child {
        width: 6rem;
        padding-right: 1rem;
      }
    }
      
  }
  
`

export const EmptyTable = styled.div`
  padding: 2rem 0;
  text-align: center;
  color: #7A7A7A;
  font-style: italic;
`

export const CountryTag = styled.span`
  font-size: 1rem;
  

  &.comma {
    :after {
      content: ", ";
    }
  }
`