import * as d3 from "d3";
import { NotationAttributes, PointNotationAttributes } from "common/baseTypes";
import useMatrixHelperUtils from "./matrixHelperUtils";
import useScreenHelper from "./screenHelper";
const matrixHelperUtils = useMatrixHelperUtils();
const screenHelper = useScreenHelper();

export default function useIntegralMatrixHelper() {
  function mergeIntegralNotations(
    svgId: string,
    notations: NotationAttributes[],
  ) {
    d3.select("#" + svgId)
      .selectAll("foreignObject")
      .data(notations, (u: any) => {
        return (u as NotationAttributes).uuid;
      })
      .join(
        (enter) => {
          return addIntegralText(enter);
        },
        (update) => {
          return updateIntegralText(update);
        },
        (exit) => {
          return matrixHelperUtils.removeNotations(exit);
        },
      );
  }

  function addIntegralText(enter: any) {
    return (
      enter
        .append("foreignObject")
        .attr("uuid", (n: PointNotationAttributes) => {
          return n.uuid;
        })
        .attr("x", (n: PointNotationAttributes) => {
          return x(n);
        })
        .attr("y", (n: PointNotationAttributes) => {
          return y(n);
        })
        .attr("width", (n: NotationAttributes) => {
          return 50;
        })
        .attr("height", (n: NotationAttributes) => {
          return 50;
        })

        .style("font-family", "STIX Two Math, Cambria Math, serif")
        .style("font-size", "36px")
        .style("fill", "#222")
        //.text("∫₋∞⁺∞ e⁻ˣ² dx = √π");
        .html((n: PointNotationAttributes) => {
          return "<p>xxx</p>";

          // const integralParts = n.value
          //   .split(/\s+/)
          //   .filter((part) => part.length > 0);
          // return integralParts.length === 1
          //   ? matrixHelperUtils.wrapWithDiv("<p style='font-size:36px'>∫</p>")
          //   : integralParts.length === 2
          //   ? matrixHelperUtils.wrapWithDiv(
          //       `<p style='font-size:36px'>∫<sub style='font-size:18px'>${integralParts[1]}</sub></p>`,
          //     )
          //   : matrixHelperUtils.wrapWithDiv(
          //       `<p style='font-size:36px'>∫<sub style='font-size:18px'>${integralParts[1]}</sub><sup style='font-size:18px'>${integralParts[2]}</sup></p>`,
          //     );
        })
    );
  }

  function updateIntegralText(update: any) {
    return update
      .attr("id", (n: PointNotationAttributes) => {
        return n.uuid;
      })
      .attr("x", (n: PointNotationAttributes) => {
        return x(n);
      })
      .attr("y", (n: PointNotationAttributes) => {
        return y(n);
      })
      .style("fill", (n: PointNotationAttributes) => {
        return matrixHelperUtils.getColor(n);
      })

      .style("display", () => {
        return "block";
      });
  }

  function x(n: PointNotationAttributes): String {
    var topLeft = screenHelper.getNotationTopLeft(n);
    return `${topLeft.x - 75}`;
  }

  function y(n: PointNotationAttributes): String {
    var topLeft = screenHelper.getNotationTopLeft(n);
    return `${topLeft.y - 35}`;
  }

  return {
    mergeIntegralNotations,
  };
}
