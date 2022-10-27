/*
 * ******************************************************************************
 *  * Copyright 2017 (C) MediaStep Software Inc.
 *  *
 *  * Created on : 09/03/2022
 *  * Author: Minh Tran <minh.tran@mediastep.com>
 *  ******************************************************************************
 */

import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import PropTypes, {arrayOf, bool, func, number, shape, string} from 'prop-types'
import Loading, {LoadingStyle} from '../Loading/Loading'

const StlWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 25px;

  &:hover #caret {
    transform: rotate(-45deg);
  }
  
  #caret {
    margin-bottom: 2px;
  }

  &:hover #conversions {
    height: fit-content;
    opacity: 1;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
    border: 1px solid #DDE0E9;
  }

  td {
    min-width: 10em;
  }
`
const StlCaret = styled.div`
  display: inline-block;
  border-top: 8px solid #000000;
  border-left: 8px solid transparent;
  transform: rotate(135deg);
  transition: all .2s ease-in-out;
`
const StlLoading = styled.div`
  padding: 20px 70px
`

const StlConversions = styled.div`
  height: 0;
  opacity: 0;
  transition: all .2s ease-in-out;
  position: absolute;
  transform: translateX(-50%);
  overflow: hidden;
  background: #FFFFFF;
  border-radius: 3px;
  box-sizing: border-box;
  z-index: 4;
  
  #conversion-content {
      thead th {
        text-align: left;
      }
      tbody td {
        padding: 15px;
      }
  }
`

const ConversionHoverButton = props => {
    const { hidden, conversions, onHover, children } = props

    const [stConversions, setStConversions] = useState(conversions)

    useEffect(() => {
        if (!conversions) {
            return
        }

        setStConversions(conversions)
    }, [conversions])

    const handleHover = () => {
        setStConversions([])
        _.debounce(onHover, 300)()
    }

    return (
        <StlWrapper onMouseEnter={ handleHover }>
            <StlCaret id="caret" hidden={ hidden }/>
            <StlConversions id="conversions" hidden={ hidden }>
                <StlLoading hidden={ stConversions.length }>
                    <Loading style={ LoadingStyle.DUAL_RING_GREY }/>
                </StlLoading>
                <table id="conversion-content">
                    { stConversions.length > 0 && children }
                </table>
            </StlConversions>
        </StlWrapper>
    )
}

ConversionHoverButton.defaultProps = {
    conversions: [],
    onHover: function () {
    }
}

ConversionHoverButton.propTypes = {
    hidden: bool,
    conversions: arrayOf(shape({
        unitName: string,
        quantity: number
    })),
    onHover: func.isRequired,
    children: PropTypes.node
}

export default ConversionHoverButton