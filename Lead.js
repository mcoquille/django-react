import React, { Component } from "react";

import { Button, ListItem, Checkbox, Modal, Fade, Backdrop, Card, Link } from "@material-ui/core";
import LinkedInIcon from '@material-ui/icons/LinkedIn';

import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import AlarmIcon from '@material-ui/icons/Alarm';

import CancelIcon from '@material-ui/icons/Cancel';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import PhoneIcon from '@material-ui/icons/Phone';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import ScheduleIcon from '@material-ui/icons/Schedule';
import WorkIcon from '@material-ui/icons/Work';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import GroupIcon from '@material-ui/icons/Group';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';
import BusinessIcon from '@material-ui/icons/Business';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import ClassIcon from '@material-ui/icons/Class';
import EventIcon from '@material-ui/icons/Event';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';

const theme = createMuiTheme({
    palette: {
      primary: {main: '#3B29A3'},
      secondary: {main: '#68BAA6'},
      cross_red: {main: '#FF6A6A'}
    },
  });

export default class Lead extends Component {
    constructor(props) {
        super(props);
        this.state = {
          isMyLead: this.props.lead.is_my_lead,
          collapseIsOpen: false,
          descriptionIsOpen: false,
          companyCardIsOpen: false,
          phoneIsOpen: false,
          show: true,
          phone: null,
        };

        this.renderCollapseArea = this.renderCollapseArea.bind(this);

        this.changeIsMyLead = this.changeIsMyLead.bind(this);

        this.renderLead = this.renderLead.bind(this);
        this.removeJob = this.removeJob.bind(this);

        this.changeCollapseIsOpen = this.changeCollapseIsOpen.bind(this);
        this.changeDescriptionIsOpen = this.changeDescriptionIsOpen.bind(this);
        this.changeCompanyCardIsOpen = this.changeCompanyCardIsOpen.bind(this);

        this.handlePhone = this.handlePhone.bind(this);

    }

    changeIsMyLead() {

        this.setState({
            isMyLead: !this.state.isMyLead
        })

        const requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                isMyLead: !this.state.isMyLead,
                pool_id: this.props.pool_id,
                user_id: sessionStorage.getItem('user_id'),
                job_id: this.props.lead.id,
            })
        }

        fetch('/api/update-corr-pool-user-job', requestOptions);

    }

    removeJob() {

        // Make it disappear on front end
        this.setState({
            show: !this.state.show
        })

        // Insert job in corr_pool_unwanted
        const requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                pool_id: this.props.pool_id,
                job_id: this.props.lead.id,
            })
        }

        fetch('/api/remove-job', requestOptions);

    }

    changeCollapseIsOpen() {
        this.setState({
            collapseIsOpen: !this.state.collapseIsOpen
          })
    }

    changeDescriptionIsOpen() {
        this.setState({
            descriptionIsOpen: !this.state.descriptionIsOpen
          })
    }

    changeCompanyCardIsOpen() {
        this.setState({
            companyCardIsOpen: !this.state.companyCardIsOpen
          })
    }

    handlePhone() {

        this.setState({phoneIsOpen: !this.state.phoneIsOpen});

        if (this.props.lead.phone) {

            this.setState({phone: this.props.lead.phone});

        } else {

            if (this.props.lead.town_id) {

                const requestOptions = {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-CSRFToken': csrftoken
                    },
                    body: JSON.stringify({
                        town_id: this.props.lead.town_id,
                        town: this.props.lead.town,
                        company_id: this.props.lead.company.id,
                        company: this.props.lead.company_name,
                    })
                }
    
                fetch('/api/handle-phone', requestOptions)
                .then((response) => response.json())
                .then((data) => {
                    this.setState({phone: data.phone});
                });
            } else {
                this.setState({phone: 'Unavailable'});
            }
        }
    }

    renderCollapseArea() {
        return(
            <ThemeProvider>
                <Collapse in={this.state.collapseIsOpen} timeout="auto" unmountOnExit>
                        <div className='collapse_area'>

                            {this.props.lead.job_function ? 
                                <div className='detail'>
                                    <WorkIcon/>
                                    <div className='detail_content'>{this.props.lead.job_function}</div>
                                 </div>
                            :null}

                            {this.props.lead.job_type ? 
                                <div className='detail'>
                                    <ScheduleIcon/>
                                    <div className='detail_content'>{this.props.lead.job_type}</div>
                                 </div>
                            :null}

                            {this.props.lead.seniority_level ? 
                                <div className='detail'>
                                    <ShowChartIcon/>
                                    <div className='detail_content'>{this.props.lead.seniority_level}</div>
                                 </div>
                            :null}
                            
                            {this.props.lead.company.company_size ? 
                                <div className='detail'>
                                    <GroupIcon/>
                                    <div className='detail_content'>{this.props.lead.company.company_size}</div>
                                 </div>
                            :null}

                            {this.props.lead.industry ? 
                                <div className='detail'>
                                    <BusinessIcon/>
                                    <div className='detail_content'>{this.props.lead.industry}</div>
                                 </div>
                            :null}

                            {this.props.lead.number_of_applicants ? 
                                <div className='detail'>
                                    <PeopleOutlineIcon/>
                                    <div className='detail_content'>{this.props.lead.number_of_applicants}</div>
                                 </div>
                            :null}

                            {this.props.lead.salary ? 
                                <div className='detail'>
                                    <MonetizationOnIcon/>
                                    <div className='detail_content'>{this.props.lead.salary}</div>
                                 </div>
                            :null}

                            <div className='detail'>
                                <Button onClick={this.handlePhone}>
                                    <div className='text_more_details purple'>See phone number</div>
                                </Button>
                                <Modal
                                    open={this.state.phoneIsOpen}
                                    onClose={this.handlePhone}
                                    closeAfterTransition
                                    BackdropComponent={Backdrop}
                                    BackdropProps={{
                                        timeout: 500,
                                    }}
                                >
                                    <Fade 
                                        className='popup'
                                        in={this.state.phoneIsOpen}
                                    >
                                        {this.state.phone ? 
                                            <div className='popup_title'>{this.state.phone}</div>
                                        : <div className='popup_title'>Searching...</div>
                                        }
                                    </Fade>
                                </Modal>
                            </div>

                            <div className='detail'>
                                <Button onClick={(this.changeDescriptionIsOpen)}>
                                    <div className='text_more_details purple'>See job description</div>
                                </Button>
                                <Modal
                                    open={this.state.descriptionIsOpen}
                                    onClose={this.changeDescriptionIsOpen}
                                    closeAfterTransition
                                    BackdropComponent={Backdrop}
                                    BackdropProps={{
                                        timeout: 500,
                                    }}
                                >
                                    <Fade 
                                        className='popup'
                                        in={this.state.descriptionIsOpen}
                                    >
                                        <div>
                                            <div className='popup_title'>Job Description</div>
                                            <br/>
                                            <br/>
                                            <div className='popup_content'>{this.props.lead.description}</div>
                                        </div>
                                    </Fade>
                                </Modal>
                            </div>
                            
                        </div>
                        
                </Collapse>
            </ThemeProvider>
        );
    }

renderLead() {

    return (
        <div>
            <ThemeProvider theme={theme}>
                <div id='lead'>
                    <ListItem>

                        <IconButton onClick={this.changeCollapseIsOpen}>
                            {this.state.collapseIsOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>

                        <img 
                            alt='logo' 
                            src='https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png' 
                            className='job_company_logo'
                        />
                        <div className='job_company_name'>{this.props.lead.company_name}</div>
                        <div className='job_title'>{this.props.lead.title}</div>
                        <div className='job_location'>{this.props.lead.town}</div>
                        <div className='job_time_since'>{this.props.lead.time_since}</div>
                        <div className='job_alarm'>
                            {this.props.lead.actively_hiring != 1 ? <AlarmIcon/>: null}
                        </div>
                        <Button 
                            className='cross_button'
                            onClick={this.removeJob}
                        >
                            <CancelIcon/>
                        </Button>
                        <Checkbox
                            color='secondary'
                            className='check_box'
                            onChange={this.changeIsMyLead}
                            checked={this.state.isMyLead}
                        >
                        </Checkbox>

                    </ListItem>
                    {this.renderCollapseArea()}
                    
                </div>
                <br/>
            </ThemeProvider>
        </div>
    );

}

    render() {
        return(
            <div>{this.state.show ? this.renderLead() : null}</div>
        );
    }

}