import * as classNames from 'classnames';
import {inject, observer} from 'mobx-react';
import {computed} from 'mobx/lib/mobx';
import * as React from 'react';
import {RootStoreProps} from '../../App';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import LoginForm from '../../components/LoginForm';
import Logo from '../../components/Logo';
import {STORE_ROOT} from '../../constants/stores';

export class LoginPage extends React.Component<RootStoreProps> {
  @computed
  private get classes() {
    return {
      'app--overlayed': this.props.rootStore!.uiStore.overlayed
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className={classNames(this.classes)}>
        <Header />
        <div className="login">
          <Logo />
          <LoginForm />
        </div>
        <Footer />
      </div>
    );
  }
}

export default inject(STORE_ROOT)(observer(LoginPage));
