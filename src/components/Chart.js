import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Table from "react-bootstrap/Table";
import Chart from "react-apexcharts";
import { chartSelector } from "../store/selectors";
import Loading from "./Loading";
import { loadAllSwaps } from "../store/interactions";
// import { options, series } from "./Chart.config";
import {
  formatEther,
  formatAddress,
  formatHash,
  formatDate,
  getSymbol,
} from "../utils";

export const Charts = () => {
  const dispatch = useDispatch();

  const provider = useSelector((state) => state.provider.connection);
//   const tokens = useSelector((state) => state.tokens.contracts);
//   const symbols = useSelector((state) => state.tokens.symbols);
//   const amm = useSelector((state) => state.amm.contract);
//   const chart = useSelector(chartSelector);

//   useEffect(() => {
//     if (provider && amm) {
//       loadAllSwaps(provider, amm, dispatch);
//     }
    
//   }, [provider, amm, dispatch]);

//   const tabledSwaps =
//     chart.swaps &&
//     chart.swaps.map((swap, idx) => {
//       return (
//         <tr key={idx}>
//           <td>{formatHash(swap.hash)}</td>
//           <td>{getSymbol(swap.args.tokenGive, tokens, symbols)}</td>
//           <td>{formatEther(swap.args.tokenGiveAmount)}</td>
//           <td>{getSymbol(swap.args.tokenGet, tokens, symbols)}</td>
//           <td>{formatEther(swap.args.tokenGetAmount)}</td>
//           <td>{formatAddress(swap.args.swapCaller)}</td>
//           <td>{formatDate(swap.args.timestamp)}</td>
//         </tr>
//       );
//     });
    
  return (
    <>
      {/* {provider && amm ? (
        <div>
          <Chart
            options={options}
            series={chart ? chart.series : series}
            type="line"
            width="100%"
            height="100%"
          />
          <hr />
          <Table bordered>
            <thead>
              <tr>
                <th>Transaction string</th>
                <th>Token Give</th>
                <th>Amount Give</th>
                <th>Token Get</th>
                <th>Amount Get</th>
                <th>User</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>{tabledSwaps}</tbody>
          </Table>
        </div>
      ) : ( */}
        <Loading />
      {/* )} */}
    </>
  );
};

export default Charts;
