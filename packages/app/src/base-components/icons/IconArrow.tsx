import { ReactComponent as ArrowDown } from "./ArrowDown.svg";
import { ReactComponent as ArrowUp } from "./ArrowUp.svg";

export default function IconArrow({
  dir,
  ...rest
}: {
  dir: "up" | "down";
  className?: string;
}) {
  return dir === "up" ? <ArrowUp {...rest} /> : <ArrowDown {...rest} />;
}
