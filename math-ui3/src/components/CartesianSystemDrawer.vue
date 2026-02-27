<template></template>

<script setup lang="ts">
import useWatchHelper from "../helpers/watchHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";

const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();

watchHelper.watchMouseEvent(
  ["CARTESIAN_SYSTEM_STARTED"],
  "EV_SVG_MOUSEDOWN",
  drawCartesianSystem,
);

function drawCartesianSystem(e: MouseEvent) {
  notationMutateHelper.addCartesianSystemAtClickedPoint(e);
}
</script>
