/*
 * Copyright (c) 2020 INSA Lyon (DISP LAB EA 4570), IMT Atlantique (LS2N LAB UMR CNRS), Ressourcial, SYNERGIHP and ODO Smart Systems
 *
 * This program has been developed in the context of the NOMAd project and is GPL v3 Licensed.
 * We would like to thank the European Union through the European regional development fund (ERDF) and the French region Auvergne-Rhône-Alpes for their financial support.
 * The following entities have been involved in the NOMAd project: INSA Lyon (DISP LAB EA 4570), IMT Atlantique (LS2N LAB UMR CNRS), Ressourcial, SYNERGIHP and Odo Smart System.
 *
 * This file is part of NOMAd.
 *
 * NOMAd is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * NOMAd is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with NOMAd.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Component, OnInit,Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {GridOptions} from "ag-grid-community";

import { BaseCrud } from '../basecrud';

import { AclRoleService } from './acl-role.service';
import { ThesaurusService } from '../thesaurus/thesaurus.service';

import { AclAction } from './acl-action';
import { AclRole } from './acl-role';

@Component({
  templateUrl: './acl-role-modal.crud.html',
})
export class ACLRoleModalCrud extends BaseCrud implements OnInit {

  @Input('aclActions') aclActions: AclAction[];
  @Input('aclRoleId') aclRoleId: string;

  public gridOptions: GridOptions;

  currentRecord : AclRole;

  constructor(private aclRoleService:AclRoleService,
              private thService:ThesaurusService,
              protected router: Router,
              public activeModal: NgbActiveModal) {
    super(aclRoleService,thService,router);
    this.currentRecord = new AclRole();
    this.gridOptions = <GridOptions>{
        rowHeight:30,
                headerHeight:30};

    this.gridOptions.columnDefs = [
      {headerName: 'Action', field: 'code',checkboxSelection: true },
      {headerName: 'Description', field: 'label' },
    ];
    this.dataLoaded.subscribe((currentRecord) => {
      this.computeChecks();
    });
  }

  ngOnInit() {
    super.init(this.aclRoleId);
  }

  gridReady(params){
    this.computeChecks()
    params.api.sizeColumnsToFit();    
  }

  computeChecks(){
    if(this.currentRecord){
      this.gridOptions.api.forEachNode(node=> {
        var selected = false;
        for(let action of (<AclRole>this.currentRecord).actions){
          if(node.data.code == action.code){
            selected = true;
            break;
          }
        }
        node.setSelected(selected);
      });
    }
  }

  saveModal() {
    (<AclRole>this.currentRecord).actions = this.gridOptions.api.getSelectedRows();
    this.save(false).subscribe((record) => {
      this.activeModal.close('Modal Closed');
    });
  }
}