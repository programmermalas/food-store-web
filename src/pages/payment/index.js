import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import * as actions from "../../redux/actions";

const schema = yup.object().shape({
  name: yup.string().required().max(255),
  cash: yup.number().required().moreThan(0),
});

const Payment = () => {
  const [state, setState] = useState({
    cash: 0,
    splash: true,
  });
  const history = useHistory();
  const cart = useSelector((state) => state.cart);
  const token = useSelector((state) => state.auth.token);
  const { register, handleSubmit, errors, setError } = useForm({
    resolver: yupResolver(schema),
  });
  const dispatch = useDispatch();

  const details = [];
  cart.menus.forEach((menu, index) => {
    details.push(
      <div
        key={index}
        className="bg-gray-100 flex items-center justify-between border rounded-md px-3 py-2 mb-3"
      >
        <div className="flex-1 flex items-center">
          <div className="w-10 h-10 bg-gray-400 rounded-lg mr-2"></div>

          <p className="text-sm text-gray-800 font-semibold truncate">
            {menu.name}
          </p>
        </div>

        <div className="flex-1 text-sm text-gray-600 text-center font-semibold">
          {menu.quantity}x
        </div>

        <div className="flex-1 text-sm text-gray-600 text-right font-semibold">
          Rp {menu.price * menu.quantity},-
        </div>
      </div>
    );
  });

  const onSubmit = async (data) => {
    if (data.cash < cart.subTotal + cart.tax) {
      setError("cash", {
        type: "manual",
        message: "cash must be greater than total",
      });
    } else {
      dispatch(actions.addOrderRequest());

      try {
        data.sub_total = cart.subTotal;
        data.tax = cart.tax;
        data.details = cart.menus;

        const order = await axios.post("/order", data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        dispatch(actions.addOrderSuccess(order.data));
      } catch (error) {
        dispatch(actions.addOrderFailure());
      }
    }
  };

  return (
    <div className="h-screen min-h-screen flex flex-col overflow-hidden bg-gray-100">
      <div className="bg-white border-b py-8">
        <div className="container mx-auto">
          <div className="text-md text-gray-800 font-semibold">Foodstore</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden container mx-auto py-4">
        <div className="flex-1 overflow-hidden flex">
          <div className="w-4/6 flex flex-col pr-4">
            <div className="flex-1 flex flex-col overflow-hidden border rounded-md bg-white p-6">
              <div className="text-md text-gray-800 font-semibold mb-4">
                Order
              </div>

              <form id="order" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col mb-4">
                  <input
                    className="text-sm text-gray-800 font-medium bg-gray-200 rounded-lg focus:outline-none p-3"
                    name="name"
                    type="text"
                    placeholder="Behalf of the ..."
                    ref={register}
                  />

                  {errors.name && (
                    <span className="text-sm text-red-400 text-center">
                      {errors.name?.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col mb-4">
                  <input
                    className="text-sm text-gray-800 font-medium bg-gray-200 rounded-lg focus:outline-none p-3"
                    name="cash"
                    type="text"
                    placeholder="Cash"
                    ref={register}
                    onChange={(event) =>
                      setState({ ...state, cash: event.target.value })
                    }
                    value={state.cash}
                  />

                  {errors.cash && (
                    <span className="text-sm text-red-400 text-center">
                      {errors.cash?.message}
                    </span>
                  )}
                </div>
              </form>

              <div className="text-md text-gray-800 font-semibold mb-4">
                Details
              </div>

              <div className="flex-1 flex flex-col overflow-y-auto">
                {details}
              </div>
            </div>
          </div>

          <div className="w-2/6">
            <div className="border rounded-md bg-white p-6">
              <div className="text-md text-gray-800 text-center font-semibold">
                Order Summary
              </div>

              <div className="divide-y-2 divide-dashed">
                <ul>
                  <li className="flex items-center justify-between text-md text-gray-800 font-semibold py-2">
                    Sub total <span>Rp {cart.subTotal},-</span>
                  </li>
                  <li className="flex items-center justify-between text-md text-gray-800 font-semibold py-2">
                    Tax <span>Rp {cart.tax},-</span>
                  </li>
                </ul>

                <div className="flex items-center justify-between text-md text-gray-800 font-semibold py-2">
                  Total <span>Rp {cart.subTotal + cart.tax},-</span>
                </div>

                <ul>
                  <li className="flex items-center justify-between text-md text-gray-800 font-semibold py-2">
                    Cash <span>Rp {state.cash},-</span>
                  </li>
                  <li className="flex items-center justify-between text-md text-gray-800 font-semibold py-2">
                    Return{" "}
                    <span>
                      Rp{" "}
                      {state.cash - cart.subTotal < 1
                        ? 0
                        : state.cash - cart.subTotal}
                      ,-
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t py-3">
        <div className="flex items-center justify-between container mx-auto">
          <button
            className="text-md text-gray-800 font-semibold"
            onClick={() => history.goBack()}
          >
            Back
          </button>

          <button
            className="bg-indigo-700 text-md text-center text-white font-semibold rounded-lg py-2 px-8"
            form="order"
          >
            Pay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;