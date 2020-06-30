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

import {Component, OnInit } from '@angular/core';
import {VehicleCategory} from './vehicle-category';
import {VehicleCategoryService} from './vehicle-category.service';

import { faWheelchair } from '@fortawesome/free-solid-svg-icons';
import { faChild } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-vehicle-category',
  templateUrl: './vehicle-category.list.html',
  styleUrls: ['./vehicle-category.css']
})
export class VehicleCategoryList implements OnInit {

  vehicleCategories : VehicleCategory[];

  faWheelchair = faWheelchair;
  faChild = faChild;

  search : string;

  constructor(private vehicleCategoryService:VehicleCategoryService) {
    this.search="";
  }

  ngOnInit() {
    this.updateList();
  }

  updateSearch(event){
    this.search=event.value;
    this.updateList();
  }

  updateList(){
    this.vehicleCategoryService.list({search: this.search, startIndex: null, length: null})
    .subscribe(vehicleCategories => {
        this.vehicleCategories = vehicleCategories as VehicleCategory[];
      }
    );
  }

}