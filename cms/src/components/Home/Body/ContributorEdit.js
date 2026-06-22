import { useParams } from "react-router-dom";
import Contributor from "./Contributor";
import Pieces from "./Pieces";

export default function ContributorEdit() {
  const { path } = useParams();
  return (
    <div className="contributor">
      <Contributor path={path} />
      <Pieces path={path} />
    </div>
  );
}
