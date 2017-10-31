import Button from 'antd/lib/button/button';
import Form, {FormComponentProps} from 'antd/lib/form/Form';
import FormItem from 'antd/lib/form/FormItem';
import 'antd/lib/form/style';
import Input from 'antd/lib/input/Input';
import * as React from 'react';

interface WalletFormProps extends FormComponentProps {
  onChangeName: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.MouseEventHandler<any>;
  onCancel: React.MouseEventHandler<any>;
}

export class WalletForm extends React.Component<WalletFormProps> {
  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <Form layout="vertical">
        <FormItem label="Name of wallet">
          {getFieldDecorator('name', {
            rules: [
              {
                message: 'Please input the name of the wallet',
                required: true
              }
            ]
          })(<Input onChange={this.props.onChangeName} />)}
        </FormItem>
        <div className="drawer__footer">
          <Button onClick={this.props.onCancel} type="ghost">
            Cancel and close
          </Button>
          <Button onClick={this.handleSubmit} type="primary">
            Generate API Key
          </Button>
        </div>
      </Form>
    );
  }

  handleSubmit: React.MouseEventHandler<any> = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onSubmit(e);
      }
    });
  };
}

export default Form.create()(WalletForm);
