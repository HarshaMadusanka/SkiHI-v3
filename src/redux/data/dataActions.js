// log
import store from "../store";

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

export const fetchData = () => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
      let totalSupply = await store
        .getState()
        .blockchain.smartContract.methods.totalSupply()
        .call();
      let publicCost = await store
        .getState()
        .blockchain.smartContract.methods.PUBLIC_SALE_PRICE()
        .call();
      let whiteListCost = await store
        .getState()
        .blockchain.smartContract.methods.WHITELIST_SALE_PRICE()
        .call();
      let publicSale = await store
        .getState()
        .blockchain.smartContract.methods.publicSale()
        .call();
      let whiteListSale = await store
        .getState()
        .blockchain.smartContract.methods.whiteListSale()
        .call();
      let salePaused = await store
        .getState()
        .blockchain.smartContract.methods.pause()
        .call();
      dispatch(
        fetchDataSuccess({
          totalSupply,
          publicCost,
          whiteListCost,
          publicSale,
          whiteListSale,
          salePaused,
          // cost,
        })
      );
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
