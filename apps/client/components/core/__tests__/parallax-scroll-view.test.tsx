import { Text } from "react-native";
import ParallaxScrollView from "@/components/core/parallax-scroll-view";
import { render } from "@/test/utils";

describe("ParallaxScrollView", () => {
  it("renders children", () => {
    const { getByText } = render(
      <ParallaxScrollView
        headerImage={<Text>Header</Text>}
        headerBackgroundColor={{ dark: "#000", light: "#fff" }}
      >
        <Text>Content</Text>
      </ParallaxScrollView>,
    );
    expect(getByText("Content")).toBeTruthy();
  });

  it("renders header image", () => {
    const { getByText } = render(
      <ParallaxScrollView
        headerImage={<Text>MyHeader</Text>}
        headerBackgroundColor={{ dark: "#000", light: "#fff" }}
      >
        <Text>Body</Text>
      </ParallaxScrollView>,
    );
    expect(getByText("MyHeader")).toBeTruthy();
  });
});
