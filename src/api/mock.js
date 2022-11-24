import Mock from "mockjs";
import overviewApi from "./mockServerData/overview";

Mock.mock("api/overview/getData", overviewApi.getStatisticalData);
