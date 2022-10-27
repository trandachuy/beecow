/*
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 2/4/2019
 * Author: Dai Mai <email: dai.mai@mediastep.com>
 */

import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import GSButton from "../../components/shared/GSButton/GSButton";
import GSTrans from "../../components/shared/GSTrans/GSTrans";
import {RouteUtils} from "../../utils/route";

class NotFound extends Component {
    render() {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    width: '100vw',
                    height: '100vh',
                    flexDirection: 'column',
                    backgroundColor: '#F2F2F2'
                }}
            >
                <div style={{
                    height: '90px',
                    width: '100%',
                    backgroundColor: '#556CE7',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 100px'
                }}>
                    <img src="/assets/images/gosell-logo-white.svg" style={{
                        height: '70px',
                    }}/>
                        <GSButton success className="d-mobile-none d-desktop-block" onClick={() => {
                            RouteUtils.redirectWithoutReload(this.props, '/')
                        }}>
                            <GSTrans t={"page.404.backHome"}/>
                        </GSButton>
                </div>


                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexGrow: '1',
                        backgroundColor: 'white',
                        width: '100%'
                    }}>
                        <img src="/assets/images/404.png" style={{
                            marginBottom: '1em'
                        }}/>
                        <p>
                            <b>
                                <GSTrans t={"page.404.pageNotFound"}/>
                            </b>
                        </p>
                        {/*<Link to="/" style={{textDecoration: 'none'}}>*/}
                            <GSButton success className="d-mobile-block d-desktop-none" onClick={() => {
                                RouteUtils.redirectWithoutReload(this.props, '/')
                            }}>
                                <GSTrans t={"page.404.backHome"}/>
                            </GSButton>
                        {/*</Link>*/}
                    </div>
            </div>
        );
    }
}

export default withRouter(NotFound);
