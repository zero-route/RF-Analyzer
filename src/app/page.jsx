import Shell from "@/components/layout/Shell";
import PresetMenu from "@/components/controls/PresetMenu";
import PowerInput from "@/components/controls/PowerInput";
import AntennaInput from "@/components/controls/AntennaInput";
import ArrayInput from "@/components/controls/ArrayInput";
import SourceModeSwitch from "@/components/controls/SourceModeSwitch";
import PhaseModeSwitch from "@/components/controls/PhaseModeSwitch";
import CableInput from "@/components/controls/CableInput";
import FrequencyPicker from "@/components/controls/FrequencyPicker";
import EirpGauge from "@/components/gauges/EirpGauge";
import PowerScale from "@/components/gauges/PowerScale";

export default function Page() {
  return (
    <Shell
      sidebar={
        <>
          <PresetMenu />
          <PowerInput />
          <AntennaInput />
          <ArrayInput />
          <SourceModeSwitch />
          <PhaseModeSwitch />
          <CableInput />
          <FrequencyPicker />
        </>
      }
    >
      <EirpGauge />
      <PowerScale />
    </Shell>
  );
}
