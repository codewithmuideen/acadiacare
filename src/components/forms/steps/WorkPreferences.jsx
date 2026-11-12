import { useFormContext } from 'react-hook-form'
import { CheckboxGroup } from '../Field'
import { jobTypes, workDays, workTimes, transport } from '../../../data/application'

export default function WorkPreferences() {
  const { register } = useFormContext()
  return (
    <div className="space-y-10">
      <CheckboxGroup type="radio" name="jobType" legend="Are you looking for…" options={jobTypes} register={register} />
      <CheckboxGroup name="workDays" legend="Preferred working days" hint="Select all that apply" options={workDays} register={register} />
      <CheckboxGroup name="workTimes" legend="Preferred working times" hint="Select all that apply" options={workTimes} register={register} />
      <CheckboxGroup name="transport" legend="Transport to work" hint="Select all that apply" options={transport} register={register} />
    </div>
  )
}
