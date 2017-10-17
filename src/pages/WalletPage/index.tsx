import Button from 'antd/lib/button/button';
import 'antd/lib/modal/style/css';
import {observable} from 'mobx';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {Redirect} from 'react-router';
import {InjectedRootStoreProps} from '../../App';
import CreateWalletForm from '../../components/CreateWalletForm';
import CreateWalletWizard, {
  Step,
  Steps
} from '../../components/CreateWalletWizard';
import Drawer from '../../components/Drawer/index';
import GenerateWalletKeyForm from '../../components/GenerateWalletKeyForm/index';
import WalletList from '../../components/WalletList';
import {ROUTE_LOGIN} from '../../constants/routes';
import {STORE_ROOT} from '../../constants/stores';
import {WalletModel} from '../../models';

export class WalletPage extends React.Component<InjectedRootStoreProps> {
  private readonly authStore = this.props.rootStore!.authStore;
  private readonly walletStore = this.props.rootStore!.walletStore;

  @observable private showCreateWalletWindow: boolean = false;
  @observable private wallet: WalletModel = new WalletModel(this.walletStore);
  @observable private activeStep: number = 1;

  componentDidMount() {
    this.walletStore.fetchAll();
  }

  render() {
    return !this.authStore.token ? ( // FIXME: refactor to ProtectedRoute HOC
      <Redirect to={ROUTE_LOGIN} />
    ) : (
      <div>
        <Button onClick={this.handleToggleDrawer}>Create new wallet</Button>
        <WalletList loading={this.walletStore.loading} />
        <Drawer title="New API Wallet" show={this.showCreateWalletWindow}>
          <h2>New Wallet</h2>
          <h3>API Wallet</h3>
          <CreateWalletWizard>
            <Steps activeIndex={this.activeStep}>
              <Step
                title="Name of wallet"
                onHide={this.handleToggleDrawer}
                onNext={this.handleCreateWallet}
                index={1}
              >
                <CreateWalletForm onChangeName={this.handleChangeWalletName} />
                <div className="drawer__footer">
                  <Button onClick={this.handleToggleDrawer} type="ghost">
                    Cancel and close
                  </Button>
                  <Button onClick={this.handleCreateWallet} type="primary">
                    Ok
                  </Button>
                </div>
              </Step>
              <Step
                title="Generate API key"
                onHide={this.handleToggleDrawer}
                onNext={this.handleCreateWallet}
                index={2}
              >
                <GenerateWalletKeyForm wallet={this.wallet} />
                <div className="drawer__footer">
                  <Button onClick={this.handleToggleDrawer} type="primary">
                    Ok
                  </Button>
                </div>
              </Step>
            </Steps>
          </CreateWalletWizard>
        </Drawer>
      </div>
    );
  }

  private readonly handleChangeWalletName: React.EventHandler<
    React.ChangeEvent<HTMLInputElement>
  > = e => {
    this.wallet.title = e.currentTarget.value;
  };

  private readonly handleCreateWallet = async () => {
    this.wallet = await this.walletStore.createApiWallet(this.wallet.title);
    this.activeStep++;
  };

  private readonly handleToggleDrawer = () =>
    (this.showCreateWalletWindow = !this.showCreateWalletWindow);
}

export default inject(STORE_ROOT)(observer(WalletPage));
