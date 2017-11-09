import {RootStore, TransferStore} from '.';
import {TransferModel} from '../models';

const rootStore = new RootStore();
const mockTransferApi = {
  cancelTransfer: jest.fn(),
  fetchOperationDetails: jest.fn(),
  startTransfer: jest.fn()
};
const mockConverterApi = {
  convertToBaseAsset: jest.fn(() => ({Converted: [{To: {Amount: 1}}]}))
};
const transferStore = new TransferStore(
  rootStore,
  mockTransferApi as any,
  mockConverterApi as any
);
rootStore.assetStore.getById = jest.fn();
const {createTransfer} = transferStore;
const {walletStore: {createWallet}} = rootStore;

describe('transfer store', () => {
  it('should hold strongly typed ref to the root store', () => {
    expect(transferStore).toHaveProperty('rootStore');
    expect(transferStore.rootStore).toBeDefined();
    expect(transferStore.rootStore).toBeInstanceOf(RootStore);
  });

  it('should hold transfers', () => {
    const {transfers} = transferStore;
    expect(transfers).toBeDefined();
    expect(transfers.length).toBe(0);
  });

  it('should add transfers', () => {
    transferStore.addTransfer(new TransferModel(transferStore));

    expect(transferStore.transfers.length).toBe(1);
  });

  it('should create transfers', () => {
    const sut = transferStore.createTransfer();

    expect(sut).toBeDefined();
    expect(sut).not.toBeNull();
  });

  it('createTransfer should provide an id', () => {
    const sut = createTransfer();

    expect(sut.id).toBeDefined();
    expect(sut.id).not.toBeNull();
  });

  it('newTransfer should not be added to transfer list', () => {
    const store = new TransferStore(
      rootStore,
      mockTransferApi,
      mockConverterApi
    );

    expect(store.transfers.length).toBe(0);
    expect(store.transfers).not.toContain(store.newTransfer);
  });

  it('should not convert if transfer currency is the same as base one', () => {
    const transferCurrency = 'TEST';
    const baseCurrency = 'TEST';

    const isRequired = transferStore.conversionIsRequired(
      transferCurrency,
      baseCurrency
    );

    expect(isRequired).toBeFalsy();
  });

  it('should convert if transfer currency is not the same as base one', () => {
    const transferCurrency = 'TEST 1';
    const baseCurrency = 'TEST 2';

    const isRequired = transferStore.conversionIsRequired(
      transferCurrency,
      baseCurrency
    );

    expect(isRequired).toBeTruthy();
  });

  it('should not request conversion api if no conversion is required', () => {
    const transferModel = new TransferModel(transferStore);
    transferModel.asset = 'TEST';
    const baseCurrency = 'TEST';

    transferStore.convertToBaseCurrency(transferModel, baseCurrency);

    expect(mockConverterApi.convertToBaseAsset).not.toBeCalled();
  });

  it('should request conversion api if conversion is required', () => {
    const transferModel = new TransferModel(transferStore);
    transferModel.asset = 'TEST 1';
    const baseCurrency = 'TEST 2';

    transferStore.convertToBaseCurrency(transferModel, baseCurrency);

    expect(mockConverterApi.convertToBaseAsset).toBeCalled();
  });

  describe('should reset new transfer', () => {
    it('should provide reset method', () => {
      expect(transferStore.resetCurrentTransfer).toBeDefined();
    });

    it('should correctly reset transfer', () => {
      const oldTransfer = transferStore.newTransfer;
      const oldId = oldTransfer.id;

      transferStore.resetCurrentTransfer();

      expect(transferStore.newTransfer).toBeDefined();
      expect(transferStore.newTransfer).not.toBeNull();
      expect(transferStore.newTransfer.id).not.toBe(oldId);
    });

    it('should reset transfer to blank state', () => {
      const oldTransfer = transferStore.newTransfer;

      transferStore.resetCurrentTransfer();

      expect(transferStore.newTransfer.asset).toBe('');
      expect(transferStore.newTransfer.amount).toBe(0);
      expect(transferStore.newTransfer).not.toEqual(oldTransfer);
      expect(transferStore.newTransfer.canTransfer).toBe(false);
    });

    it('should not add resetted transfer to store', () => {
      transferStore.transfers = [];
      transferStore.resetCurrentTransfer();

      expect(transferStore.transfers.length).toBe(0);
      expect(transferStore.transfers).not.toContainEqual(
        transferStore.newTransfer
      );
    });
  });

  describe('submit transfer', () => {
    let sut: TransferModel;
    const createValidTransfer = (transfer?: TransferModel) => {
      sut = transfer || createTransfer();
      const sourceWallet = createWallet({Id: 1, Name: 'w1'});
      const destWallet = createWallet({Id: 2, Name: 'w2'});
      sut.setWallet(sourceWallet, 'from');
      sut.setWallet(destWallet, 'to');
      sut.setAmount(100);
      sut.setAsset('LKK');
      return sut;
    };

    beforeEach(() => {
      createValidTransfer();
    });

    test('sanity check on transfer create helper', () => {
      expect(createValidTransfer().canTransfer).toBe(true);
    });

    it('should pass dest wallet id to the transfer object', () => {
      expect(sut.asJson.WalletId).toBe(sut.to.id);
    });

    it('should not call api when transfer is not valid', () => {
      transferStore.startTransfer = jest.fn();
      sut.asset = '';

      sut.sendTransfer();

      expect(transferStore.startTransfer).not.toBeCalled();
    });

    it('should call api when transfer is valid', () => {
      transferStore.startTransfer = jest.fn();

      sut.sendTransfer();

      expect(transferStore.startTransfer).toBeCalled();
      expect(transferStore.startTransfer).toBeCalledWith(sut);
    });
  });

  describe('finish transfer', () => {
    let sut: TransferModel;
    const createValidTransfer = (transfer?: TransferModel) => {
      sut = transfer || createTransfer();
      const sourceWallet = createWallet({Id: 1, Name: 'w1'});
      const destWallet = createWallet({Id: 2, Name: 'w2'});
      sut.setWallet(sourceWallet, 'from');
      sut.setWallet(destWallet, 'to');
      sut.setAmount(100);
      sut.setAsset('LKK');
      return sut;
    };

    beforeEach(() => {
      createValidTransfer();
      sut.from.deposit = jest.fn();
      sut.from.withdraw = jest.fn();
      sut.to.deposit = jest.fn();
      sut.to.withdraw = jest.fn();
    });

    it('should call deposit and withdraw on related wallets', () => {
      transferStore.finishTransfer(sut);

      expect(sut.from.withdraw).toBeCalled();
      expect(sut.from.deposit).not.toBeCalled();
      expect(sut.to.deposit).toBeCalled();
      expect(sut.to.withdraw).not.toBeCalled();
    });

    it('should call deposit on dest wallet with transfer amount and asset', () => {
      transferStore.finishTransfer(sut);
      expect(sut.to.deposit).toBeCalledWith(sut.amount, sut.asset);
    });

    it('should call withdraw on source wallet with transfer amount and asset', () => {
      transferStore.finishTransfer(sut);
      expect(sut.from.withdraw).toBeCalledWith(sut.amount, sut.asset);
    });

    it('should reset current transfer', () => {
      sut = createValidTransfer(transferStore.newTransfer);
      const id = transferStore.newTransfer.id;

      transferStore.finishTransfer(sut);

      expect(transferStore.newTransfer.canTransfer).toBe(false);
      expect(transferStore.newTransfer.id).not.toBe(id);
    });
  });
});
