import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'PowerBiUpdatesHubWebPartStrings';
import { PowerBiUpdatesHub } from './components/PowerBiUpdatesHub';
import { IPowerBiUpdatesHubProps } from './components/IPowerBiUpdatesHubProps';

export interface IPowerBiUpdatesHubWebPartProps {
  updatesListName: string;
  subscribersListName: string;
  pageSize: number;
}

export default class PowerBiUpdatesHubWebPart extends BaseClientSideWebPart<IPowerBiUpdatesHubWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IPowerBiUpdatesHubProps> = React.createElement(PowerBiUpdatesHub, {
      context: this.context,
      updatesListName: this.properties.updatesListName || 'Power BI Updates',
      subscribersListName: this.properties.subscribersListName || 'Power BI Update Subscribers',
      pageSize: this.properties.pageSize || 200,
    });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: 'List settings',
              groupFields: [
                PropertyPaneTextField('updatesListName', {
                  label: strings.UpdatesListNameFieldLabel,
                }),
                PropertyPaneTextField('subscribersListName', {
                  label: strings.SubscribersListNameFieldLabel,
                }),
                PropertyPaneTextField('pageSize', {
                  label: strings.PageSizeFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
