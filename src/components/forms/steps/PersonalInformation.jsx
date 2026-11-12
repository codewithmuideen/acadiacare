import { useFormContext } from 'react-hook-form'
import { TextField, SelectField } from '../Field'
import { titles, countries } from '../../../data/application'

export default function PersonalInformation() {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  return (
    <div className="space-y-10">
      <div className="grid gap-5 sm:grid-cols-6">
        <SelectField label="Title" optional placeholder="Select" options={titles} className="sm:col-span-2" {...register('title')} />
        <TextField label="Forename" required autoComplete="given-name" className="sm:col-span-2" error={errors.forename?.message} {...register('forename')} />
        <TextField label="Surname" required autoComplete="family-name" className="sm:col-span-2" error={errors.surname?.message} {...register('surname')} />
      </div>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-display text-2xl">Address</legend>
        <TextField label="Address line 1" required autoComplete="address-line1" className="sm:col-span-2" error={errors.address1?.message} {...register('address1')} />
        <TextField label="Address line 2" optional autoComplete="address-line2" className="sm:col-span-2" {...register('address2')} />
        <TextField label="Town / City" required autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
        <TextField label="County / State / Province" optional autoComplete="address-level1" {...register('region')} />
        <TextField label="Postcode" required autoComplete="postal-code" error={errors.postcode?.message} {...register('postcode')} />
        <SelectField label="Country" required options={countries} autoComplete="country-name" error={errors.country?.message} {...register('country')} />
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-display text-2xl">Contact details</legend>
        <TextField label="Email" type="email" required autoComplete="email" inputMode="email" error={errors.email?.message} {...register('email')} />
        <TextField label="Phone" type="tel" required autoComplete="tel" inputMode="tel" error={errors.phone?.message} {...register('phone')} />
        <TextField label="Emergency contact name" required autoComplete="off" error={errors.emergencyName?.message} {...register('emergencyName')} />
        <TextField
          label="Emergency contact telephone"
          type="tel"
          required
          autoComplete="off"
          inputMode="tel"
          error={errors.emergencyPhone?.message}
          {...register('emergencyPhone')}
        />
      </fieldset>
    </div>
  )
}
