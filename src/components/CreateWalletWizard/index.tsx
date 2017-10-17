import * as React from 'react';

export interface CreateWalletsWizardProps {
  steps?: React.ReactChildren[];
}

export class CreateWalletWizard extends React.Component<
  CreateWalletsWizardProps
> {
  render() {
    return <div>{this.props.children}</div>;
  }
}

interface WizardStepsProps {
  activeIndex: number;
}

interface WizardStepProps {
  title: string;
  index: number;
  total?: number;
  onNext: any;
  onHide: any;
}

export const Steps: React.SFC<WizardStepsProps> = props => {
  const steps = props.children as Array<React.ReactElement<WizardStepProps>>;
  return steps
    .filter(x => x.props.index === props!.activeIndex)
    .map(x => (
      <Step key={x.props.index} {...x.props} total={steps.length} />
    )) as any;
};

export const Step: React.SFC<WizardStepProps> = ({
  title,
  onHide,
  onNext,
  index,
  total,
  children
}) => (
  <div>
    <div>
      <h4>
        {title}&nbsp;
        <small>{`Step ${index} of ${total}`}</small>
      </h4>
    </div>
    {children}
  </div>
);

export default CreateWalletWizard;
