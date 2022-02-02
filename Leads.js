import React, { Component } from "react";

import { List, IconButton, ListItem, TextField, Checkbox } from "@material-ui/core";
import Lead from './Lead';

import Autocomplete from '@material-ui/lab/Autocomplete';
import { IconContext } from "react-icons";
import FilterListIcon from '@material-ui/icons/FilterList';
import CloseIcon from '@material-ui/icons/Close';

export default class Leads extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterIsOpen: false,
            dct_selected_ids: {},
            dim_job_function: this.props.leads_data.dim.dim_job_function,
            dim_job_type: this.props.leads_data.dim.dim_job_type,
            dim_seniority_level: this.props.leads_data.dim.dim_seniority_level,
            dim_industry: this.props.leads_data.dim.dim_industry,
            last_index: 9,
            selected_lead_ids_by_description: null,
            my_leads: null,
        }

        this.renderFilter = this.renderFilter.bind(this);
        this.render = this.render.bind(this);
        this.renderFilterAutocomplete = this.renderFilterAutocomplete.bind(this);
        this.updateDctUnselectedIds = this.updateDctUnselectedIds.bind(this);
        this.handleValuesIds = this.handleValuesIds.bind(this);

        this.handleSelectJobFunction = this.handleSelectJobFunction.bind(this);
        this.handleSelectJobType = this.handleSelectJobType.bind(this);
        this.handleSelectSeniorityLevel = this.handleSelectSeniorityLevel.bind(this);
        this.handleSelectIndustry = this.handleSelectIndustry.bind(this);
        this.handleSelectMyLeads = this.handleSelectMyLeads.bind(this);
    }

    renderFilterAutocomplete(dim, placeholder, func) {

        return(

          <Autocomplete
            className='filter'
            multiple
            options={dim}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                placeholder={placeholder}
              />
            )}
            onChange={func}
          >
          </Autocomplete>

      )
    }

    renderFilter() {
    
        return (
          <>
            <IconContext.Provider value={{ color: '#3B29A3' }}>
              <IconButton onClick={() => this.setState({filterIsOpen: !this.state.filterIsOpen})}>
                <FilterListIcon className='filter_icon' />
              </IconButton>
              <nav className={this.state.filterIsOpen ? 'filter-menu active' : 'filter-menu'}>
  
                <List>
  
                  <ListItem>
                    <IconButton onClick={() => this.setState({filterIsOpen: !this.state.filterIsOpen})}>
                      <CloseIcon/>
                    </IconButton >
                  </ListItem>
  
                  <ListItem>
                    {this.renderFilterAutocomplete(
                      this.state.dim_job_function, 'Function', this.handleSelectJobFunction)}
                  </ListItem>

                  <br/>

                  <ListItem>
                    {this.renderFilterAutocomplete(
                          this.state.dim_job_type, 'Job Type', this.handleSelectJobType)}
                  </ListItem>

                  <br/>

                  <ListItem>
                    {this.renderFilterAutocomplete(
                          this.state.dim_seniority_level, 'Seniority Level', this.handleSelectSeniorityLevel)}
                  </ListItem>

                  <br/>

                  <ListItem>
                    {this.renderFilterAutocomplete(
                          this.state.dim_industry, 'Industry', this.handleSelectIndustry)}
                  </ListItem>

                  <br/>

                </List>
              </nav>
            </IconContext.Provider>
          </>
        );
      }

    updateDctUnselectedIds(feature, unselected_ids) {
        
      let copy_dct_selected_ids = { ...this.state.dct_selected_ids};  
      copy_dct_selected_ids[feature] = unselected_ids

      this.setState({
        dct_selected_ids : copy_dct_selected_ids,
      })
    }

    handleValuesIds(values, feature) {
        if (values.length === 0) {
            var attribute = `${feature}_id`
            var selected_ids = this.props.leads_data.filter_leads.map(filter => filter[attribute])
        } else {
            var selected_ids = values.map(value => value.id);
        }
        this.updateDctUnselectedIds(feature, selected_ids);
    }

    handleSelectJobFunction = (event, values) => {
        this.handleValuesIds(values, 'job_function')
    }

    handleSelectJobType = (event, values) => {
      this.handleValuesIds(values, 'job_type');
    }

    handleSelectSeniorityLevel = (event, values) => {
      this.handleValuesIds(values, 'seniority_level');
    }

    handleSelectIndustry = (event, values) => {
      this.handleValuesIds(values, 'industry');
    }

    handleSelectMyLeads = (event, values) => {
      if (values === null) {
        this.setState({my_leads : null})
      } else {
        if (values.id === 1) {
          this.setState({my_leads : true})
        } else {
          this.setState({my_leads : false})
        }
      }
    }

    render() {

        var filter_leads = this.props.leads_data.filter_leads
        var dct_selected_ids = this.state.dct_selected_ids

        // Filter leads based on categories
        for (const feature in dct_selected_ids) {

            var attribute = `${feature}_id`

            var filter_leads = filter_leads.filter(
                lead => dct_selected_ids[feature].includes(lead[attribute])
            )
        }

        // Filter leads based on My Leads
        if (this.state.my_leads != null) {
            filter_leads = filter_leads.filter(
                lead => lead.is_my_lead === this.state.my_leads
            )
        }

        // Select ID only
        filter_leads = filter_leads.map(
          lead => lead.id
        )

        // Remove duplicates
        filter_leads = [...new Set(filter_leads)]

        // Filter based on index
        var selected_job_ids = filter_leads.filter(
          lead => filter_leads.indexOf(lead) <= this.state.last_index
        )

        // Get leads
        var selected_leads = this.props.leads_data.leads.filter(
          lead => selected_job_ids.includes(lead.id)
        )

        return(
            <div>
                <div>{this.renderFilter()}</div>
                <List id='lst_of_leads'>

                    {selected_leads.map(
                        (lead) => <Lead lead={lead} pool_id={this.props.pool_id} my_leads={this.state.my_leads} />
                    )}

                    {selected_leads.length <= this.state.last_index ? null : 
                        <button 
                          className='button' 
                          id='button_show_more' 
                          onClick={() => this.setState({last_index: this.state.last_index += 10})}>
                            Show more
                        </button>
                    }
                </List>

            </div>
        );
    }
}